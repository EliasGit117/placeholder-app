import sharp from 'sharp';
import { rgbaToThumbHash } from 'thumbhash';
import { ORPCError } from '@orpc/server';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { bytesToMb } from '@/lib/utils';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageDtoFactory, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { getImagePolicy } from '@/features/images/consts/image-resource-map.ts';
import type { TCreateImageInput } from '@/features/images/schemas/image-mutations.ts';

interface PrepareFileInput {
  file: File;
  resourceType: ImageResourceType;
  purpose: ImagePurpose;
}

export interface PreparedImage {
  file: File;
  width: number;
  height: number;
  mimeType: string;
  thumbhash: string;
}

export class ImageService {

  static validateAgainstPolicy(input: PrepareFileInput): void {
    const policy = getImagePolicy(input.resourceType, input.purpose);
    if (!policy)
      throw new ORPCError('BAD_REQUEST', {
        message: 'Image purpose not allowed for this resource.'
      });

    if (input.file.size === 0)
      throw new ORPCError('BAD_REQUEST', { message: 'File is empty.' });

    if (policy.maxSize && input.file.size > policy.maxSize)
      throw new ORPCError('BAD_REQUEST', {
        message: `File must be smaller than ${bytesToMb(policy.maxSize)}MB.`
      });

    if (policy.mimeTypes && !isMimeAllowed(input.file.type, policy.mimeTypes))
      throw new ORPCError('BAD_REQUEST', {
        message: `File type must be one of: ${policy.mimeTypes.join(', ')}.`,
      });

  }

  static async prepareFile(input: PrepareFileInput): Promise<PreparedImage> {
    ImageService.validateAgainstPolicy(input);

    const policy = getImagePolicy(input.resourceType, input.purpose)!;
    const inputBuffer = Buffer.from(await input.file.arrayBuffer());
    let pipeline = sharp(inputBuffer).ensureAlpha();

    if (policy.transform) {
      pipeline = pipeline.resize({
        width: policy.transform.width,
        height: policy.transform.height,
        fit: policy.transform.fit ?? 'inside',
        position: policy.transform.position ?? 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
        withoutEnlargement: true
      });
    }

    if (input.file.type !== 'image/webp')
      pipeline = pipeline.webp({ alphaQuality: 100 });

    const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });

    const baseName = input.file.name.replace(/\.[^.]+$/, '');
    const file = new File([new Uint8Array(data)], `${baseName}.webp`, {
      type: 'image/webp'
    });

    const thumbhash = await generateThumbhash(data);

    return { file, width: info.width, height: info.height, mimeType: 'image/webp', thumbhash };
  }

  static async create(input: TCreateImageInput): Promise<TImageDto> {
    const entity = await prisma.image.create({
      data: {
        url: input.url,
        key: input.key,
        size: input.size,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        thumbhash: input.thumbhash ?? null,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        purpose: input.purpose
      }
    });

    return ImageDtoFactory.fromEntity(entity);
  }

  static async findById(id: number): Promise<TImageDto | null> {
    const entity = await prisma.image.findUnique({ where: { id } });
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
      orderBy: { createdAt: 'desc' }
    });

    return ImageDtoFactory.fromEntities(entities);
  }

  static async delete(id: number): Promise<void> {
    const entity = await prisma.image.findUnique({ where: { id } });
    if (!entity)
      throw new ORPCError('NOT_FOUND');

    await prisma.image.delete({ where: { id } });
    await s3Storage.delete(entity.key);
  }

  static async replace(id: number, input: TCreateImageInput): Promise<TImageDto> {
    const existing = await prisma.image.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    const entity = await prisma.image.update({
      where: { id },
      data: {
        url: input.url,
        key: input.key,
        size: input.size,
        mimeType: input.mimeType,
        width: input.width,
        height: input.height,
        thumbhash: input.thumbhash ?? null,
        resourceType: input.resourceType,
        resourceId: input.resourceId ?? null,
        purpose: input.purpose
      }
    });

    await s3Storage.delete(existing.key);

    return ImageDtoFactory.fromEntity(entity);
  }
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