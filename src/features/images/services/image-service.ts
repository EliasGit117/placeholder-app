import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { ORPCError } from '@orpc/server';
import { ImagePurpose, ImageResourceType, ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import { prisma, type TxClient } from '@/lib/db';
import { bytesToMb } from '@/lib/utils';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageDtoFactory, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { allowsMultipleImages, getImagePolicy, type ImageConfig } from '@/features/images/consts/image-resource-map.ts';
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

type ImageTransform = NonNullable<ImageConfig['original']>;

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

    const original = await transformToWebp(inputBuffer, policy.original, `${baseName}.webp`);
    const thumbhash = await generateThumbhash(inputBuffer);

    const variants: PreparedVariant[] = [];
    for (const spec of policy.variants ?? []) {
      const prepared = await transformToWebp(inputBuffer, spec.transform, `${baseName}-${spec.kind}.webp`);
      variants.push({ kind: spec.kind, ...prepared });
    }

    return { original: { ...original, thumbhash }, variants };
  }

  static async upload(input: UploadInput): Promise<TImageDto> {
    const prepared = await ImageService.prepareImage(input);

    const uploadedOriginal = await s3Storage.upload(prepared.original.file, { acl: 'public-read' });
    const uploadedVariants = await Promise.all(
      prepared.variants.map(async (variant) => ({
        variant,
        uploaded: await s3Storage.upload(variant.file, { acl: 'public-read' }),
      }))
    );

    return ImageService.create({
      url: uploadedOriginal.url,
      key: uploadedOriginal.key,
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
      if (!allowsMultipleImages(input.resourceType, input.purpose)) {
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
          variants: input.variants?.length ? { create: input.variants } : undefined,
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

      // A permutation can't be applied in place under the unique constraint, so
      // park every row at a unique negative slot first, then flip to the final
      // 1..N. Negatives never clash with leftover positives; finals never clash
      // with the still-negative rows.
      for (let i = 0; i < orderedIds.length; i++)
        await tx.image.update({ where: { id: orderedIds[i] }, data: { order: -(i + 1) } });

      for (let i = 0; i < orderedIds.length; i++)
        await tx.image.update({ where: { id: orderedIds[i] }, data: { order: i + 1 } });
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
      select: { id: true, order: true },
    });

    for (let i = 0; i < remaining.length; i++) {
      const desired = i + 1;
      if (remaining[i].order !== desired)
        await tx.image.update({ where: { id: remaining[i].id }, data: { order: desired } });
    }
  }
}

async function transformToWebp(
  inputBuffer: Buffer,
  transform: ImageTransform,
  fileName: string
): Promise<PreparedFile> {
  const { data, info } = await sharp(inputBuffer)
    .ensureAlpha()
    .resize({
      width: transform.width,
      height: transform.height,
      fit: transform.fit ?? 'inside',
      position: transform.position ?? 'center',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: true
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
