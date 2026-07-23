import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionValuesSchema } from '@/features/products/common/dtos/option-schema.ts';
import { slugSchema } from '@/features/shared/schemas/slug.ts';


// Shared shape of an editable variant. create/add/update are all derived from this.
export const variantBaseDtoSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  state: z.enum(ProductState).default(ProductState.ACTIVE),
  slug: slugSchema,
  sku: z.string().trim().min(1).max(128),
  optionValues: optionValuesSchema,
  price: z.number().int().nonnegative(),
});

// Used for the variants nested in a product create payload.
export const createVariantDtoSchema = variantBaseDtoSchema;

// Adding a variant to an existing product.
export const addVariantDtoSchema = variantBaseDtoSchema.extend({
  productId: z.number(),
});

// Updating an existing variant — every field optional, identified by id.
export const updateVariantDtoSchema = variantBaseDtoSchema.partial().extend({
  id: z.number(),
});

export type TCreateVariantDto = z.infer<typeof createVariantDtoSchema>;
export type TAddVariantDto = z.infer<typeof addVariantDtoSchema>;
export type TUpdateVariantDto = z.infer<typeof updateVariantDtoSchema>;
