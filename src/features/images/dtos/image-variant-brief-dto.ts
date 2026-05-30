import { z } from 'zod';
import type { Prisma } from '~/prisma/generated/prisma/client.ts';
import { imageVariantDtoSchema } from './image-variant-dto.ts';

type TImageVariant = Prisma.ImageVariantGetPayload<Record<string, never>>;

// Just the rendering essentials — no storage/internal fields.
export const imageVariantBriefDtoSchema = imageVariantDtoSchema.pick({
  id: true,
  kind: true,
  url: true,
  width: true,
  height: true,
});

export type TImageVariantBriefDto = z.infer<typeof imageVariantBriefDtoSchema>;

export class ImageVariantBriefDtoFactory {
  static fromEntity(entity: TImageVariant): TImageVariantBriefDto {
    return {
      id: entity.id,
      kind: entity.kind,
      url: entity.url,
      width: entity.width,
      height: entity.height,
    };
  }

  static fromEntities(entities: TImageVariant[]): TImageVariantBriefDto[] {
    return entities.map(ImageVariantBriefDtoFactory.fromEntity);
  }
}
