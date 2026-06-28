import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import type { TImageDto } from '@/features/images/dtos/image-dto.ts';
import { bannerDtoSchema, BannerDtoFactory } from '@/features/banners/dtos/banner.ts';
import { bannerImageDtoSchema, BannerImageDtoFactory } from '@/features/banners/dtos/banner-image.ts';
import { bannerImagePurposeByDevice } from '@/features/banners/consts/banner-devices.ts';
import { bannerImageStatuses, getBannerImageStatus } from '@/features/banners/consts/banner-image-status.ts';


// Admin list row: the banner plus both device images, so the table renders the
// thumbnails (and their thumbhash placeholders) without a second request.
// `imageStatus` reports which required device images are present, so the admin
// can spot/filter banners that can't be shown publicly (need both desktop +
// mobile).
export const bannerBriefDtoSchema = bannerDtoSchema.extend({
  image: bannerImageDtoSchema.nullish(),
  mobileImage: bannerImageDtoSchema.nullish(),
  imageStatus: z.enum(bannerImageStatuses),
});

export type TBannerBriefDto = z.infer<typeof bannerBriefDtoSchema>;

export class BannerBriefDtoFactory {

  // Picks the banner's desktop (3:1) and mobile (6:5) images out of `images`
  // (which may hold images for other banners and devices), filtering by resource
  // id and purpose. A banner needs both to be public-valid; `imageStatus`
  // reports which are present.
  static fromEntity(entity: Banner, images: TImageDto[]): TBannerBriefDto {
    const id = String(entity.id);
    const byPurpose = (purpose: TImageDto['purpose']) =>
      images.find((img) => img.resourceId === id && img.purpose === purpose) ?? null;

    const desktop = byPurpose(bannerImagePurposeByDevice.desktop);
    const mobile = byPurpose(bannerImagePurposeByDevice.mobile);

    return {
      ...BannerDtoFactory.fromEntity(entity),
      image: BannerImageDtoFactory.fromImageDto(desktop),
      mobileImage: BannerImageDtoFactory.fromImageDto(mobile),
      imageStatus: getBannerImageStatus(desktop != null, mobile != null),
    };
  }

  static fromEntities(entities: Banner[], images: TImageDto[]): TBannerBriefDto[] {
    return entities.map((entity) => BannerBriefDtoFactory.fromEntity(entity, images));
  }
}
