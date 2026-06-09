import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import { BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '~/src/paraglide/runtime';


// Public banner: localized text for the active locale plus the per-breakpoint
// alignment, so the storefront can position each image (CSS object-position)
// without exposing the untranslated ro/ru columns or internal timestamps.
export const bannerPublicDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  href: z.string().nullish(),
  mobileXAlign: z.enum(BannerXAlign),
  mobileYAlign: z.enum(BannerYAlign),
  tabletXAlign: z.enum(BannerXAlign),
  tabletYAlign: z.enum(BannerYAlign),
  desktopXAlign: z.enum(BannerXAlign),
  desktopYAlign: z.enum(BannerYAlign),
});

export type TBannerPublicDto = z.infer<typeof bannerPublicDtoSchema>;

export class BannerPublicDtoFactory {

  static fromEntity(entity: Banner, locale: Locale): TBannerPublicDto {
    const suffix = capitalizeFirst(locale);
    return {
      id: entity.id,
      order: entity.order,
      title: entity[`title${suffix}`] ?? undefined,
      description: entity[`description${suffix}`] ?? undefined,
      href: entity.href ?? undefined,
      mobileXAlign: entity.mobileXAlign,
      mobileYAlign: entity.mobileYAlign,
      tabletXAlign: entity.tabletXAlign,
      tabletYAlign: entity.tabletYAlign,
      desktopXAlign: entity.desktopXAlign,
      desktopYAlign: entity.desktopYAlign,
    };
  }

  static fromEntities(entities: Banner[], locale: Locale): TBannerPublicDto[] {
    return entities.map((entity) => BannerPublicDtoFactory.fromEntity(entity, locale));
  }
}
