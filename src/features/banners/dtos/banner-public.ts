import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import {
  bannerImagePublicDtoSchema,
  BannerImagePublicDtoFactory,
} from '@/features/banners/dtos/banner-image.ts';
import { bannerImagePurposeByLocaleDevice } from '@/features/banners/consts/banner-devices.ts';
import type { TImageDto } from '@/features/images/dtos/image-dto.ts';
import type { Locale } from '@/paraglide/runtime';


export const bannerPublicDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  href: z.string().nullish(),
  image: bannerImagePublicDtoSchema.nullish(),
  mobileImage: bannerImagePublicDtoSchema.nullish(),
});

export type TBannerPublicDto = z.infer<typeof bannerPublicDtoSchema>;

export class BannerPublicDtoFactory {

  // Picks the banner's desktop and mobile images for `locale` out of `images`
  // (which may hold images for other banners, locales and devices), filtering by
  // resource id and purpose.
  static fromEntity(entity: Banner, images: TImageDto[] = [], locale: Locale): TBannerPublicDto {
    const id = String(entity.id);
    const purposes = bannerImagePurposeByLocaleDevice[locale];
    const byPurpose = (purpose: TImageDto['purpose']) =>
      images.find((img) => img.resourceId === id && img.purpose === purpose) ?? null;

    return {
      id: entity.id,
      order: entity.order,
      href: entity.href ?? undefined,
      image: BannerImagePublicDtoFactory.fromImageDto(byPurpose(purposes.desktop)),
      mobileImage: BannerImagePublicDtoFactory.fromImageDto(byPurpose(purposes.mobile)),
    };
  }

  static fromEntities(entities: Banner[], images: TImageDto[], locale: Locale): TBannerPublicDto[] {
    return entities.map((entity) => BannerPublicDtoFactory.fromEntity(entity, images, locale));
  }
}
