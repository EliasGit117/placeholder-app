import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import {
  bannerImagePublicDtoSchema,
  BannerImagePublicDtoFactory,
} from '@/features/banners/dtos/banner-image.ts';
import { bannerImagePurposeByDevice } from '@/features/banners/consts/banner-devices.ts';
import type { TImageDto } from '@/features/images/dtos/image-dto.ts';


export const bannerPublicDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  href: z.string().nullish(),
  // Desktop image (3:1, required) plus the optional mobile image (6:5).
  image: bannerImagePublicDtoSchema.nullish(),
  mobileImage: bannerImagePublicDtoSchema.nullish(),
});

export type TBannerPublicDto = z.infer<typeof bannerPublicDtoSchema>;

export class BannerPublicDtoFactory {

  // Picks the banner's desktop and mobile images out of `images` (which may hold
  // images for other banners and devices), filtering by resource id and purpose.
  static fromEntity(entity: Banner, images: TImageDto[] = []): TBannerPublicDto {
    const id = String(entity.id);
    const byPurpose = (purpose: TImageDto['purpose']) =>
      images.find((img) => img.resourceId === id && img.purpose === purpose) ?? null;

    return {
      id: entity.id,
      order: entity.order,
      href: entity.href ?? undefined,
      image: BannerImagePublicDtoFactory.fromImageDto(byPurpose(bannerImagePurposeByDevice.desktop)),
      mobileImage: BannerImagePublicDtoFactory.fromImageDto(byPurpose(bannerImagePurposeByDevice.mobile)),
    };
  }

  static fromEntities(entities: Banner[], images: TImageDto[]): TBannerPublicDto[] {
    return entities.map((entity) => BannerPublicDtoFactory.fromEntity(entity, images));
  }
}
