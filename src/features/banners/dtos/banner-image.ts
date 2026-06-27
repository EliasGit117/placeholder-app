import { z } from 'zod';
import { imageDtoSchema, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { bannerImagePurpose } from '@/features/banners/consts/banner-devices.ts';

// Only rendering essentials are exposed — internal storage fields (key, size,
// resource ownership, timestamps) are intentionally dropped so they never reach
// clients, since the public banner endpoints are anonymous. `thumbhash` is the
// blur-up placeholder used before the image loads.
export const bannerImageDtoSchema = imageDtoSchema
  .pick({
    id: true,
    url: true,
    width: true,
    height: true,
    thumbhash: true,
  });

export type TBannerImageDto = z.infer<typeof bannerImageDtoSchema>;

// Public image: drops `id` on top of the admin image — anonymous clients only
// need render fields, never the internal image id.
export const bannerImagePublicDtoSchema = bannerImageDtoSchema.omit({ id: true });

export type TBannerImagePublicDto = z.infer<typeof bannerImagePublicDtoSchema>;

export class BannerImageDtoFactory {

  static fromImageDto(dto: TImageDto | null): TBannerImageDto | null {
    return dto ? {
      id: dto.id,
      url: dto.url,
      width: dto.width,
      height: dto.height,
      thumbhash: dto.thumbhash,
    } : null;
  }
}

export class BannerImagePublicDtoFactory {

  static fromImageDto(dto: TImageDto | null): TBannerImagePublicDto | null {
    return dto ? {
      url: dto.url,
      width: dto.width,
      height: dto.height,
      thumbhash: dto.thumbhash,
    } : null;
  }
}

export { bannerImagePurpose };
