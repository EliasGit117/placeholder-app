import { gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';
import { z } from 'zod';


export const createGallerySectionDtoSchema = gallerySectionDtoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type TCreateGallerySectionDto = z.infer<typeof createGallerySectionDtoSchema>;