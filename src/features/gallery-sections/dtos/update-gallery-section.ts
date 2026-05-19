import { gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';
import { z } from 'zod';


export const updateGallerySectionDtoSchema = gallerySectionDtoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial();

export type TUpdateGallerySectionDto = z.infer<typeof updateGallerySectionDtoSchema>;