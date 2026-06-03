import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionValuesSchema } from '@/features/products/schemas/option-schema.ts';


// Shared shape of an editable variant. create/add/update are all derived from this.
export const variantBaseSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  state: z.enum(ProductState).default(ProductState.active),
  sku: z.string().trim().min(1).max(128),
  optionValues: optionValuesSchema,
  price: z.number().int().nonnegative(),
});

// Used for the variants nested in a product create payload.
export const createVariantSchema = variantBaseSchema;

// Adding a variant to an existing product.
export const addVariantSchema = variantBaseSchema.extend({
  productId: z.number(),
});

// Updating an existing variant — every field optional, identified by id.
export const updateVariantSchema = variantBaseSchema.partial().extend({
  id: z.number(),
});

export type TCreateVariantInput = z.infer<typeof createVariantSchema>;
export type TAddVariantInput = z.infer<typeof addVariantSchema>;
export type TUpdateVariantInput = z.infer<typeof updateVariantSchema>;
