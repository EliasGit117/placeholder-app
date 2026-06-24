import { z } from 'zod';
import { bannerDtoSchema } from '@/features/banners/dtos/banner.ts';
import { bannerPublicDtoSchema } from '@/features/banners/dtos/banner-public.ts';
import { bannerImagesDtoSchema, bannerImagesPublicDtoSchema } from '@/features/banners/dtos/banner-image.ts';


// Admin detail payload: the full banner row plus its three device images.
export const bannerWithImagesDtoSchema = z.object({
  banner: bannerDtoSchema,
  images: bannerImagesDtoSchema,
});

export type TBannerWithImagesDto = z.infer<typeof bannerWithImagesDtoSchema>;

// Public payload: localized banner plus its three device images.
export const bannerPublicWithImagesDtoSchema = z.object({
  banner: bannerPublicDtoSchema,
  images: bannerImagesPublicDtoSchema,
});

export type TBannerPublicWithImagesDto = z.infer<typeof bannerPublicWithImagesDtoSchema>;
