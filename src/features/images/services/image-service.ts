import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { ORPCError } from '@orpc/server';
import { ImagePurpose, ImageResourceType, ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { bytesToMb } from '@/lib/utils';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageDtoFactory, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { getImagePolicy, type ImageConfig } from '@/features/images/consts/image-resource-map.ts';
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
    const entity = await prisma.image.create({
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
        resourceId: input.resourceId ?? null,
        purpose: input.purpose,
        variants: input.variants?.length ? { create: input.variants } : undefined,
      },
      include: { variants: true },
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
      orderBy: { createdAt: 'desc' }
    });

    return ImageDtoFactory.fromEntities(entities);
  }

  static async delete(id: number): Promise<void> {
    const entity = await prisma.image.findUnique({ where: { id }, include: { variants: true } });
    if (!entity)
      throw new ORPCError('NOT_FOUND');

    await prisma.image.delete({ where: { id } });
    await s3Storage.delete([entity.key, ...entity.variants.map(v => v.key)]);
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
