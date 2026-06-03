import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema } from '@/features/products/schemas/option-schema.ts';
import { createVariantSchema } from '@/features/products/schemas/product-variant-mutations.ts';


const slugSchema = z.string().trim().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

// Shared shape of an editable product. create/update are both derived from this.
export const productBaseSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  descriptionRo: z.string().trim().max(512).optional(),
  descriptionRu: z.string().trim().max(512).optional(),
  state: z.enum(ProductState).default(ProductState.active),
  slug: slugSchema,
  options: optionsSchema,
});

// Creating a product also requires its initial variants (at least one).
export const createProductSchema = productBaseSchema.extend({
  variants: z.array(createVariantSchema).min(1),
});

// Updating a product — every field optional; variants are managed via the variant endpoints.
export const updateProductSchema = productBaseSchema.partial();

export type TCreateProductInput = z.infer<typeof createProductSchema>;
export type TUpdateProductInput = z.infer<typeof updateProductSchema>;
