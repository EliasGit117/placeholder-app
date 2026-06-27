import { z } from 'zod';
import { bannerDtoSchema } from '@/features/banners/dtos/banner.ts';
import { bannerImageDtoSchema } from '@/features/banners/dtos/banner-image.ts';


// Admin list row: the banner plus its single image, so the table renders the
// thumbnail (and its thumbhash placeholder) without a second request.
export const bannerRowDtoSchema = bannerDtoSchema.extend({
  image: bannerImageDtoSchema.nullish(),
});

export type TBannerRowDto = z.infer<typeof bannerRowDtoSchema>;
