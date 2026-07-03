import { z } from 'zod';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import type { Prisma } from '~/prisma/generated/prisma/client.ts';
import { imageVariantDtoSchema, ImageVariantDtoFactory } from './image-variant-dto.ts';

type TImage = Prisma.ImageGetPayload<{ include: { variants: true } }>;

export const imageDtoSchema = z.object({
  id: z.number(),
  url: z.string(),
  key: z.string(),
  customId: z.string().nullable(),
  generatedId: z.string().nullable(),
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  thumbhash: z.string().nullable(),
  resourceType: z.enum(ImageResourceType),
  resourceId: z.string().nullable(),
  purpose: z.enum(ImagePurpose),
  order: z.number(),
  variants: z.array(imageVariantDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TImageDto = z.infer<typeof imageDtoSchema>;

export class ImageDtoFactory {
  static fromEntity(entity: TImage): TImageDto {
    return {
      id: entity.id,
      url: entity.url,
      key: entity.key,
      customId: entity.customId,
      generatedId: entity.generatedId,
      name: entity.name,
      size: entity.size,
      mimeType: entity.mimeType,
      width: entity.width,
      height: entity.height,
      thumbhash: entity.thumbhash,
      resourceType: entity.resourceType,
      resourceId: entity.resourceId,
      purpose: entity.purpose,
      order: entity.order,
      variants: ImageVariantDtoFactory.fromEntities(entity.variants),
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static fromEntities(entities: TImage[]): TImageDto[] {
    return entities.map(ImageDtoFactory.fromEntity);
  }
}
