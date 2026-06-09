import { z } from 'zod';
import { createBannerDtoSchema } from '@/features/banners/dtos/create-banner.ts';


export const updateBannerDtoSchema = createBannerDtoSchema.partial();

export type TUpdateBannerDto = z.infer<typeof updateBannerDtoSchema>;
