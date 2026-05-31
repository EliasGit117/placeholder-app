import { z } from 'zod';
import type { GallerySection } from '~/prisma/generated/prisma/client.ts';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';


export const gallerySectionDtoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  nameRo: z.string(),
  nameRu: z.string(),
  descriptionRo: z.string().nullish(),
  descriptionRu: z.string().nullish(),
  state: z.enum(GallerySectionState),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TGallerySectionDto = z.infer<typeof gallerySectionDtoSchema>;

export class GallerySectionDtoFactory {

  static fromEntity(entity: GallerySection): TGallerySectionDto {
    return {
      id: entity.id,
      slug: entity.slug,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      descriptionRo: entity.descriptionRo,
      descriptionRu: entity.descriptionRu,
      state: entity.state,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    }
  }

  static fromEntities(entities: GallerySection[]): TGallerySectionDto[] {
    return entities.map(this.fromEntity);
  }
}