import { ORPCError } from '@orpc/server';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageDtoFactory, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import type { TCreateImageInput } from '@/features/images/schemas/image-mutations.ts';

export class ImageService {

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
        purpose: input.purpose,
      },
    });

    return ImageDtoFactory.fromEntity(entity);
  }

  static async findById(id: number): Promise<TImageDto | null> {
    const entity = await prisma.image.findUnique({ where: { id } });
    return entity ? ImageDtoFactory.fromEntity(entity) : null;
  }

  static async findByResource(
    resourceType: ImageResourceType,
    resourceId?: number | null,
    purpose?: ImagePurpose,
  ): Promise<TImageDto[]> {
    const entities = await prisma.image.findMany({
      where: {
        resourceType,
        ...(resourceId !== undefined && { resourceId }),
        ...(purpose !== undefined && { purpose }),
      },
      orderBy: { createdAt: 'desc' },
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
        purpose: input.purpose,
      },
    });

    await s3Storage.delete(existing.key);

    return ImageDtoFactory.fromEntity(entity);
  }
}
