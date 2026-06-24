import { z } from 'zod';
import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';
import { imageDtoSchema, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { bannerDevicePurpose, bannerDevices, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';

// Only rendering essentials are exposed — internal storage fields (key, size,
// resource ownership, timestamps) are intentionally dropped so they never reach
// clients, since the public banner endpoints are anonymous. `thumbhash` is the
// blur-up placeholder used before the image loads.
const bannerImageDtoSchema = imageDtoSchema
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
const bannerImagePublicDtoSchema = bannerImageDtoSchema.omit({ id: true });

export type TBannerImagePublicDto = z.infer<typeof bannerImagePublicDtoSchema>;

// A banner's two breakpoint images as a typed map. Either slot may be absent.
export const bannerImagesDtoSchema = z.object({
  compact: bannerImageDtoSchema.nullish(),
  wide: bannerImageDtoSchema.nullish(),
});

export type TBannerImagesDto = z.infer<typeof bannerImagesDtoSchema>;

// Public counterpart of the image map — same shape, id-less images.
export const bannerImagesPublicDtoSchema = z.object({
  compact: bannerImagePublicDtoSchema.nullish(),
  wide: bannerImagePublicDtoSchema.nullish(),
});

export type TBannerImagesPublicDto = z.infer<typeof bannerImagesPublicDtoSchema>;

export class BannerImagesDtoFactory {

  static fromImageDtos(dtos: TImageDto[]): TBannerImagesDto {
    const result: TBannerImagesDto = { compact: undefined, wide: undefined };

    for (const device of bannerDevices) {
      const purpose = bannerDevicePurpose[device];
      const dto = dtos.find((d) => d.purpose === purpose);
      if (dto)
        result[device] = toBannerImage(dto);
    }

    return result;
  }
}

function toBannerImage(dto: TImageDto): TBannerImageDto {
  return {
    id: dto.id,
    url: dto.url,
    width: dto.width,
    height: dto.height,
    thumbhash: dto.thumbhash,
  };
}

export class BannerImagesPublicDtoFactory {

  static fromImageDtos(dtos: TImageDto[]): TBannerImagesPublicDto {
    const result: TBannerImagesPublicDto = { compact: undefined, wide: undefined };

    for (const device of bannerDevices) {
      const purpose = bannerDevicePurpose[device];
      const dto = dtos.find((d) => d.purpose === purpose);
      if (dto)
        result[device] = toBannerImagePublic(dto);
    }

    return result;
  }
}

function toBannerImagePublic(dto: TImageDto): TBannerImagePublicDto {
  return {
    url: dto.url,
    width: dto.width,
    height: dto.height,
    thumbhash: dto.thumbhash,
  };
}

export { bannerDevicePurpose, bannerDevices };
export type { BannerDevice, ImagePurpose };
