import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';

const slugSchema = z.string().trim().min(1).max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

// Basic product fields only — options and variants are managed on the details page.
export const createProductFormSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  shortDescriptionRo: z.string().trim().max(512).optional(),
  shortDescriptionRu: z.string().trim().max(512).optional(),
  slug: slugSchema,
  state: z.enum(ProductState),
  categoryId: z.number().int().positive().nullable(),
});

export type TCreateProductForm = z.infer<typeof createProductFormSchema>;
