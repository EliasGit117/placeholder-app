import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { ORPCError } from '@orpc/server';
import { ImagePurpose, ImageResourceType, ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import { Prisma } from '~/prisma/generated/prisma/client.ts';
import { prisma, type TxClient } from '@/lib/db';
import { bytesToMb } from '@/lib/utils';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageDtoFactory, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { getImagePolicy, type ImageConfig, type ImageTransform } from '@/features/images/consts/image-resource-map.ts';
import type { TCreateImageInput } from '@/features/images/schemas/image-mutations.ts';

interface UploadInput {
  file: File;
  resourceType: ImageResourceType;
  purpose: ImagePurpose;
  resourceId?: string;
  // Base file name (without extension) for the stored object. Falls back to
  // the uploaded file's name.
  fileName?: string;
}

interface PreparedFile {
  file: File;
  width: number;
  height: number;
}

interface PreparedVariant extends PreparedFile {
  kind: ImageVariantKind;
}

interface PreparedImage {
  original: PreparedFile & { thumbhash: string };
  variants: PreparedVariant[];
}

export class ImageService {

  static validateAgainstPolicy(file: File, policy: ImageConfig | undefined): asserts policy is ImageConfig {
    if (!policy)
      throw new ORPCError('BAD_REQUEST', {
        message: 'Image purpose not allowed for this resource.'
      });

    if (file.size === 0)
      throw new ORPCError('BAD_REQUEST', { message: 'File is empty.' });

    if (policy.maxSize && file.size > policy.maxSize)
      throw new ORPCError('BAD_REQUEST', {
        message: `File must be smaller than ${bytesToMb(policy.maxSize)}MB.`
      });

    if (policy.mimeTypes && !isMimeAllowed(file.type, policy.mimeTypes))
      throw new ORPCError('BAD_REQUEST', {
        message: `File type must be one of: ${policy.mimeTypes.join(', ')}.`,
      });
  }

  static async prepareImage(input: UploadInput): Promise<PreparedImage> {
    const policy = getImagePolicy(input.resourceType, input.purpose);
    ImageService.validateAgainstPolicy(input.file, policy);

    const baseName = input.fileName ?? input.file.name.replace(/\.[^.]+$/, '');
    const inputBuffer = Buffer.from(await input.file.arrayBuffer());

    const original = await transformToWebp(inputBuffer, policy, `${baseName}.webp`);
    const thumbhash = await generateThumbhash(inputBuffer);

    const variants: PreparedVariant[] = [];
    for (const spec of policy.variants ?? []) {
      const prepared = await transformToWebp(inputBuffer, spec, `${baseName}-${spec.kind}.webp`);
      variants.push({ kind: spec.kind, ...prepared });
    }

    return { original: { ...original, thumbhash }, variants };
  }

  static async upload(input: UploadInput): Promise<TImageDto> {
    const prepared = await ImageService.prepareImage(input);

    // Generate a GUID per file up front so it can travel as the UploadThing
    // customId and then be persisted on the entity after a successful upload.
    const uploadedOriginal = await s3Storage.upload(prepared.original.file, {
      acl: 'public-read',
      customId: crypto.randomUUID(),
    });
    const uploadedVariants = await Promise.all(
      prepared.variants.map(async (variant) => ({
        variant,
        uploaded: await s3Storage.upload(variant.file, {
          acl: 'public-read',
          customId: crypto.randomUUID(),
        }),
      }))
    );

    return ImageService.create({
      url: uploadedOriginal.url,
      key: uploadedOriginal.key,
      customId: uploadedOriginal.customId ?? undefined,
      name: uploadedOriginal.name,
      size: uploadedOriginal.size,
      mimeType: 'image/webp',
      width: prepared.original.width,
      height: prepared.original.height,
      thumbhash: prepared.original.thumbhash,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      purpose: input.purpose,
      variants: uploadedVariants.map(({ variant, uploaded }) => ({
        kind: variant.kind,
        url: uploaded.url,
        key: uploaded.key,
        customId: uploaded.customId ?? undefined,
        name: uploaded.name,
        size: uploaded.size,
        width: variant.width,
        height: variant.height,
      })),
    });
  }

  static async create(input: TCreateImageInput): Promise<TImageDto> {
    const resourceId = input.resourceId ?? null;

    // Assign the next order within the resource scope. Uploading many images
    // fires parallel requests, so the max lookup and insert must be serialized
    // per scope or they race and violate the (resourceType, resourceId, order)
    // unique constraint. A transaction-level advisory lock keyed on the scope
    // serializes concurrent creates for the same resource (across connections)
    // while leaving other resources unblocked; it auto-releases on commit.
    const entity = await prisma.$transaction(async (tx) => {
      await ImageService.lockScope(tx, input.resourceType, resourceId);

      // Single-cardinality purposes (e.g. avatars) may have at most one image
      // per resource scope. The scope lock makes this check race free.
      if (!getImagePolicy(input.resourceType, input.purpose)?.multiple) {
        const count = await tx.image.count({
          where: { resourceType: input.resourceType, resourceId, purpose: input.purpose },
        });
        if (count > 0)
          throw new ORPCError('CONFLICT', {
            message: 'This resource already has an image for this purpose.',
          });
      }

      const last = await tx.image.findFirst({
        where: { resourceType: input.resourceType, resourceId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      return tx.image.create({
        data: {
          url: input.url,
          key: input.key,
          customId: input.customId ?? null,
          name: input.name,
          size: input.size,
          mimeType: input.mimeType,
          width: input.width,
          height: input.height,
          thumbhash: input.thumbhash ?? null,
          resourceType: input.resourceType,
          resourceId,
          purpose: input.purpose,
          order: last ? last.order + 1 : 1,
          variants: input.variants?.length
            ? { create: input.variants.map((v) => ({ ...v, customId: v.customId ?? null })) }
            : undefined,
        },
        include: { variants: true },
      });
    });

    return ImageDtoFactory.fromEntity(entity);
  }

  static async findById(id: number): Promise<TImageDto | null> {
    const entity = await prisma.image.findUnique({ where: { id }, include: { variants: true } });
    return entity ? ImageDtoFactory.fromEntity(entity) : null;
  }

  static async findByResource(
    resourceType: ImageResourceType,
    resourceId?: string | null,
    purpose?: ImagePurpose
  ): Promise<TImageDto[]> {
    const entities = await prisma.image.findMany({
      where: {
        resourceType,
        ...(resourceId !== undefined && { resourceId }),
        ...(purpose !== undefined && { purpose })
      },
      include: { variants: true },
      orderBy: { order: 'asc' }
    });

    return ImageDtoFactory.fromEntities(entities);
  }

  // Batch variant of findByResource: fetches images for many resource ids of
  // the same type in one query (ordered by resource then display order). Callers
  // group by resourceId. Avoids an N+1 when listing images for sibling resources.
  static async findByResources(
    resourceType: ImageResourceType,
    resourceIds: string[]
  ): Promise<TImageDto[]> {
    if (resourceIds.length === 0)
      return [];

    const entities = await prisma.image.findMany({
      where: { resourceType, resourceId: { in: resourceIds } },
      include: { variants: true },
      orderBy: [{ resourceId: 'asc' }, { order: 'asc' }]
    });

    return ImageDtoFactory.fromEntities(entities);
  }

  // Distinct resource ids that own at least one image of the given purpose.
  // Lets callers filter their own rows down to those with an image without an
  // N+1 or loading the image payloads.
  static async findResourceIdsWithImage(
    resourceType: ImageResourceType,
    purpose: ImagePurpose
  ): Promise<string[]> {
    const rows = await prisma.image.findMany({
      where: { resourceType, purpose, resourceId: { not: null } },
      distinct: ['resourceId'],
      select: { resourceId: true },
    });

    return rows
      .map((r) => r.resourceId)
      .filter((id): id is string => id !== null);
  }

  static async delete(id: number): Promise<void> {
    const entity = await prisma.image.findUnique({ where: { id }, include: { variants: true } });
    if (!entity)
      throw new ORPCError('NOT_FOUND');

    await prisma.$transaction(async (tx) => {
      await ImageService.lockScope(tx, entity.resourceType, entity.resourceId);
      await tx.image.delete({ where: { id } });
      await ImageService.resequence(tx, entity.resourceType, entity.resourceId);
    });

    await s3Storage.delete([entity.key, ...entity.variants.map(v => v.key)]);
  }

  // Deletes the given images (and their variants) scoped to a resource, so
  // callers can't remove images that belong to a different owner. Returns the
  // number actually deleted.
  static async deleteManyForResource(
    resourceType: ImageResourceType,
    resourceId: string,
    ids: number[]
  ): Promise<number> {
    const entities = await prisma.image.findMany({
      where: { id: { in: ids }, resourceType, resourceId },
      include: { variants: true },
    });

    if (entities.length === 0)
      return 0;

    const keys = entities.flatMap(e => [e.key, ...e.variants.map(v => v.key)]);

    await prisma.$transaction(async (tx) => {
      await ImageService.lockScope(tx, resourceType, resourceId);
      await tx.image.deleteMany({ where: { id: { in: entities.map(e => e.id) } } });
      await ImageService.resequence(tx, resourceType, resourceId);
    });
    await s3Storage.delete(keys);

    return entities.length;
  }

  // Deletes every image (and its variants + storage files) belonging to a
  // resource. Used when the owning resource itself is deleted. Returns the
  // number actually deleted.
  static async deleteAllForResource(
    resourceType: ImageResourceType,
    resourceId: string
  ): Promise<number> {
    const entities = await prisma.image.findMany({
      where: { resourceType, resourceId },
      include: { variants: true },
    });

    if (entities.length === 0)
      return 0;

    const keys = entities.flatMap(e => [e.key, ...e.variants.map(v => v.key)]);

    await prisma.image.deleteMany({ where: { id: { in: entities.map(e => e.id) } } });
    await s3Storage.delete(keys);

    return entities.length;
  }

  // Applies a new display order for a resource scope. `orderedIds` must be the
  // full set of images for that scope (the new sequence); the result is the
  // canonical, freshly ordered list. Rejects a stale/partial id set so order
  // stays a gapless, unique 1..N.
  static async reorderForResource(
    resourceType: ImageResourceType,
    resourceId: string,
    orderedIds: number[]
  ): Promise<TImageDto[]> {
    await prisma.$transaction(async (tx) => {
      await ImageService.lockScope(tx, resourceType, resourceId);

      const existing = await tx.image.findMany({
        where: { resourceType, resourceId },
        select: { id: true },
      });
      const existingIds = new Set(existing.map(e => e.id));
      const uniqueIds = new Set(orderedIds);

      // Must be exactly the current set: same size, no dupes, no strangers.
      if (
        orderedIds.length !== existingIds.size ||
        uniqueIds.size !== orderedIds.length ||
        orderedIds.some(id => !existingIds.has(id))
      )
        throw new ORPCError('BAD_REQUEST', {
          message: 'Provided ids must match the images of this resource exactly.',
        });

      // A permutation can't be applied in place under the unique index, so park
      // every row at a unique negative slot first, then flip to the final 1..N.
      // Negatives never clash with leftover positives; finals never clash with
      // the still-negative rows. Each phase is a single bulk statement (one
      // round-trip), not one update per row.
      await ImageService.applyOrders(tx, orderedIds.map((id, i) => ({ id, order: -(i + 1) })));
      await ImageService.applyOrders(tx, orderedIds.map((id, i) => ({ id, order: i + 1 })));
    });

    return ImageService.findByResource(resourceType, resourceId);
  }

  // Serializes order mutations for a resource scope across connections, so
  // concurrent uploads/deletes can't race on the (resourceType, resourceId,
  // order) unique constraint. Released automatically when the transaction ends.
  private static async lockScope(
    tx: TxClient,
    resourceType: ImageResourceType,
    resourceId: string | null
  ): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`${resourceType}:${resourceId ?? ''}`}))`;
  }

  // Compacts orders to a gapless 1..N within a resource scope after deletions.
  // Caller must hold the scope lock. Updating in ascending order is collision
  // free because every new value only shrinks, so the target slot is free.
  private static async resequence(
    tx: TxClient,
    resourceType: ImageResourceType,
    resourceId: string | null
  ): Promise<void> {
    const remaining = await tx.image.findMany({
      where: { resourceType, resourceId },
      orderBy: { order: 'asc' },
      select: { id: true },
    });

    // applyOrders no-ops when nothing remains (e.g. the last image was deleted).
    await ImageService.applyOrders(tx, remaining.map((row, i) => ({ id: row.id, order: i + 1 })));
  }

  // Sets an explicit `order` per id in a single statement, so a reorder phase or
  // a resequence is one round-trip instead of one update per row. Caller must
  // hold the scope lock. No-op on an empty list — an empty VALUES clause is a
  // SQL syntax error. Matching on the (globally unique) id PK is enough; the
  // caller has already validated the ids belong to the intended scope.
  private static async applyOrders(
    tx: TxClient,
    pairs: { id: number; order: number }[]
  ): Promise<void> {
    if (pairs.length === 0)
      return;

    const rows = Prisma.join(pairs.map(p => Prisma.sql`(${p.id}::int, ${p.order}::int)`));

    await tx.$executeRaw`
      UPDATE "images" AS img
      SET "order" = v.ord
      FROM (VALUES ${rows}) AS v(id, ord)
      WHERE img.id = v.id
    `;
  }
}

async function transformToWebp(
  inputBuffer: Buffer,
  transform: ImageTransform,
  fileName: string
): Promise<PreparedFile> {
  const fit = transform.fit ?? 'inside';

  // `withoutEnlargement` keeps small images from being upscaled — but for the
  // cropping fits (`cover`/`fill`) it would also suppress the crop when the
  // source is smaller than the target, leaving the original aspect intact. Those
  // fits must always produce the exact requested dimensions (e.g. 3:1 banners),
  // so only guard against enlargement for the non-cropping fits.
  const withoutEnlargement = fit === 'inside' || fit === 'contain';

  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .resize({
      width: transform.width,
      height: transform.height,
      fit,
      position: transform.position ?? 'center',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement
    })
    .webp({ alphaQuality: 100 })
    .toBuffer({ resolveWithObject: true });

  const file = new File([new Uint8Array(data)], fileName.toLowerCase(), { type: 'image/webp' });
  return { file, width: info.width, height: info.height };
}

async function generateThumbhash(imageBuffer: Buffer): Promise<string> {
  const { data, info } = await sharp(imageBuffer)
    .resize({ width: 100, height: 100, fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const hash = rgbaToThumbHash(info.width, info.height, data);
  return Buffer.from(hash).toString('base64');
}

function isMimeAllowed(fileType: string, allowed: readonly string[]) {
  return allowed.some(type => {
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.replace('/*', '/'));
    }
    return fileType === type;
  });
}
