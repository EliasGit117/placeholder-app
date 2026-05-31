import { gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';
import { z } from 'zod';


export const gallerySectionSlugSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

export const createGallerySectionDtoSchema = gallerySectionDtoSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .extend({ slug: gallerySectionSlugSchema });

export type TCreateGallerySectionDto = z.infer<typeof createGallerySectionDtoSchema>;
