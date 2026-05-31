import { gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';
import { gallerySectionSlugSchema } from '@/features/gallery-sections/dtos/create-gallery-section.ts';
import { z } from 'zod';


export const updateGallerySectionDtoSchema = gallerySectionDtoSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({ slug: gallerySectionSlugSchema })
  .partial();

export type TUpdateGallerySectionDto = z.infer<typeof updateGallerySectionDtoSchema>;
