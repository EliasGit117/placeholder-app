import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema } from '@/features/products/schemas/option-schema.ts';


const slugSchema = z.string().trim().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

// Shared shape of an editable product. create/update are both derived from this.
export const productBaseSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  shortDescriptionRo: z.string().trim().max(4096).optional(),
  shortDescriptionRu: z.string().trim().max(4096).optional(),
  state: z.enum(ProductState).default(ProductState.active),
  slug: slugSchema,
  options: optionsSchema,
  categoryId: z.number().int().positive().nullable().optional(),
});

// Creating a product takes only the basic fields; options and variants are added afterwards on the
// product details page via their own endpoints. `options` may be supplied but defaults to empty.
export const createProductSchema = productBaseSchema.extend({
  options: optionsSchema.optional(),
});

// Updating a product — every field optional; variants are managed via the variant endpoints.
export const updateProductSchema = productBaseSchema.partial();

export type TCreateProductInput = z.infer<typeof createProductSchema>;
export type TUpdateProductInput = z.infer<typeof updateProductSchema>;
