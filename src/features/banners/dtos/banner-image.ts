import { z } from 'zod';
import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';
import { imageDtoSchema, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { bannerDevicePurpose, bannerDevices, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';

// Only rendering essentials are exposed — internal storage fields (key, size,
// resource ownership, timestamps) are intentionally dropped so they never reach
// clients, since the public banner endpoints are anonymous. `thumbUrl` is the
// 256px square thumbnail used by the admin list preview.
const bannerImageDtoSchema = imageDtoSchema
  .pick({
    id: true,
    url: true,
    width: true,
    height: true,
    thumbhash: true,
  });

export type TBannerImageDto = z.infer<typeof bannerImageDtoSchema>;

// A banner's three breakpoint images as a typed map. Any device may be absent
// (all images are optional), so each slot is nullable.
export const bannerImagesDtoSchema = z.object({
  mobile: bannerImageDtoSchema.nullish(),
  tablet: bannerImageDtoSchema.nullish(),
  desktop: bannerImageDtoSchema.nullish(),
});

export type TBannerImagesDto = z.infer<typeof bannerImagesDtoSchema>;

export class BannerImagesDtoFactory {

  static fromImageDtos(dtos: TImageDto[]): TBannerImagesDto {
    const result: TBannerImagesDto = { mobile: undefined, tablet: undefined, desktop: undefined };

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

// Re-exported for callers that need to map a device → purpose without importing
// the consts module directly (kept here so the DTO layer is self-contained).
export { bannerDevicePurpose, bannerDevices };
export type { BannerDevice, ImagePurpose };
