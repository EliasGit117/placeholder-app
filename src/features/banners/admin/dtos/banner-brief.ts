import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import type { TImageDto } from '@/features/images/common/dtos/image.ts';
import { bannerDtoSchema, BannerDtoFactory } from '@/features/banners/admin/dtos/banner.ts';
import { bannerImageDtoSchema, BannerImageDtoFactory } from '@/features/banners/admin/dtos/banner-image.ts';
import { bannerImagePurposeByLocaleDevice } from '@/features/banners/common/consts/banner-devices.ts';
import { bannerImageStatuses, getBannerImageStatus } from '@/features/banners/common/consts/banner-image-status.ts';
import { baseLocale, locales } from '@/paraglide/runtime';


// Admin list row: the banner plus both base-locale device images, so the table
// renders the thumbnails (and their thumbhash placeholders) without a second
// request. `imageStatus` is aggregated across every locale (complete/partial/
// empty); per-locale management lives in the banner detail form.
export const bannerBriefDtoSchema = bannerDtoSchema.extend({
  image: bannerImageDtoSchema.nullish(),
  mobileImage: bannerImageDtoSchema.nullish(),
  imageStatus: z.enum(bannerImageStatuses),
});

export type TBannerBriefDto = z.infer<typeof bannerBriefDtoSchema>;

export class BannerBriefDtoFactory {

  // The row thumbnails show the base-locale desktop (3:1) and mobile (6:5)
  // images, picked out of `images` (which may hold images for other banners,
  // locales and devices) by resource id + purpose. `imageStatus` is aggregated
  // over every locale's device presence.
  static fromEntity(entity: Banner, images: TImageDto[]): TBannerBriefDto {
    const id = String(entity.id);
    const byPurpose = (purpose: TImageDto['purpose']) =>
      images.find((img) => img.resourceId === id && img.purpose === purpose) ?? null;

    const basePurposes = bannerImagePurposeByLocaleDevice[baseLocale];
    const desktop = byPurpose(basePurposes.desktop);
    const mobile = byPurpose(basePurposes.mobile);

    const perLocale = locales.map((locale) => {
      const purposes = bannerImagePurposeByLocaleDevice[locale];
      return {
        hasDesktop: byPurpose(purposes.desktop) != null,
        hasMobile: byPurpose(purposes.mobile) != null,
      };
    });

    return {
      ...BannerDtoFactory.fromEntity(entity),
      image: BannerImageDtoFactory.fromImageDto(desktop),
      mobileImage: BannerImageDtoFactory.fromImageDto(mobile),
      imageStatus: getBannerImageStatus(perLocale),
    };
  }

  static fromEntities(entities: Banner[], images: TImageDto[]): TBannerBriefDto[] {
    return entities.map((entity) => BannerBriefDtoFactory.fromEntity(entity, images));
  }
}
