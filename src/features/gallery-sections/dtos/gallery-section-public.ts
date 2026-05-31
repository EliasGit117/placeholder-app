import { z } from 'zod';
import type { GallerySection } from '~/prisma/generated/prisma/client.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '~/src/paraglide/runtime';


export const gallerySectionPublicDtoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullish(),
});

export type TGallerySectionPublicDto = z.infer<typeof gallerySectionPublicDtoSchema>;

export class GallerySectionPublicDtoFactory {

  static fromEntity(entity: GallerySection, locale: Locale): TGallerySectionPublicDto {
    return {
      id: entity.id,
      slug: entity.slug,
      name: entity[`name${capitalizeFirst(locale)}`],
      description: entity[`description${capitalizeFirst(locale)}`] ?? undefined,
    };
  }

  static fromEntities(entities: GallerySection[], locale: Locale): TGallerySectionPublicDto[] {
    return entities.map(enitity => this.fromEntity(enitity, locale));
  }
}
