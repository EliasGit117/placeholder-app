import { z } from 'zod';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import {
  bannerImagePublicDtoSchema,
  BannerImagePublicDtoFactory,
} from '@/features/banners/dtos/banner-image.ts';
import type { TImageDto } from '@/features/images/dtos/image-dto.ts';


export const bannerPublicDtoSchema = z.object({
  id: z.number(),
  order: z.number(),
  href: z.string().nullish(),
  image: bannerImagePublicDtoSchema.nullish(),
});

export type TBannerPublicDto = z.infer<typeof bannerPublicDtoSchema>;

export class BannerPublicDtoFactory {

  static fromEntity(entity: Banner, image: TImageDto | null = null): TBannerPublicDto {
    return {
      id: entity.id,
      order: entity.order,
      href: entity.href ?? undefined,
      image: BannerImagePublicDtoFactory.fromImageDto(image),
    };
  }
}
