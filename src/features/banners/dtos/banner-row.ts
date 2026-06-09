import { z } from 'zod';
import { bannerDtoSchema } from '@/features/banners/dtos/banner.ts';
import { bannerImagesDtoSchema } from '@/features/banners/dtos/banner-image.ts';


// Admin list row: the banner plus its three device images, so the table renders
// each thumbnail (and its thumbhash placeholder) without a second request.
export const bannerRowDtoSchema = bannerDtoSchema.extend({
  images: bannerImagesDtoSchema,
});

export type TBannerRowDto = z.infer<typeof bannerRowDtoSchema>;
