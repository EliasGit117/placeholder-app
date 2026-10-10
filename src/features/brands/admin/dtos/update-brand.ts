import { z } from 'zod';
import { createBrandDtoSchema } from '@/features/brands/admin/dtos/create-brand.ts';


export const updateBrandDtoSchema = createBrandDtoSchema.partial();

export type TUpdateBrandDto = z.infer<typeof updateBrandDtoSchema>;
