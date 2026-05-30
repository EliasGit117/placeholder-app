import { z } from 'zod';
import type { Prisma } from '~/prisma/generated/prisma/client.ts';
import { imageDtoSchema } from './image-dto.ts';
import { imageVariantBriefDtoSchema, ImageVariantBriefDtoFactory } from './image-variant-brief-dto.ts';

type TImage = Prisma.ImageGetPayload<{ include: { variants: true } }>;

// Just the rendering essentials — no storage/internal fields.
export const imageBriefDtoSchema = imageDtoSchema
  .pick({
    id: true,
    url: true,
    width: true,
    height: true,
    thumbhash: true,
  })
  .extend({
    variants: z.array(imageVariantBriefDtoSchema),
  });

export type TImageBriefDto = z.infer<typeof imageBriefDtoSchema>;

export class ImageBriefDtoFactory {
  static fromEntity(entity: TImage): TImageBriefDto {
    return {
      id: entity.id,
      url: entity.url,
      width: entity.width,
      height: entity.height,
      thumbhash: entity.thumbhash,
      variants: ImageVariantBriefDtoFactory.fromEntities(entity.variants),
    };
  }

  static fromEntities(entities: TImage[]): TImageBriefDto[] {
    return entities.map(ImageBriefDtoFactory.fromEntity);
  }
}
