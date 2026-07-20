import { z } from 'zod';
import { createBannerDtoSchema } from '@/features/banners/admin/dtos/create-banner.ts';


export const updateBannerDtoSchema = createBannerDtoSchema.partial();

export type TUpdateBannerDto = z.infer<typeof updateBannerDtoSchema>;
