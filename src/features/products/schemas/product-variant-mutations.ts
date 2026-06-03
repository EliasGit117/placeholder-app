import { z } from 'zod';
import { optionValuesSchema } from '@/features/products/schemas/option-schema.ts';


export const createVariantSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  optionValues: optionValuesSchema,
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
});

export const addVariantSchema = createVariantSchema.extend({
  productId: z.number(),
});

export const updateVariantSchema = z.object({
  id: z.number(),
  nameRo: z.string().trim().min(1).max(128).optional(),
  nameRu: z.string().trim().min(1).max(128).optional(),
  optionValues: optionValuesSchema.optional(),
  price: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type TCreateVariantInput = z.infer<typeof createVariantSchema>;
export type TAddVariantInput = z.infer<typeof addVariantSchema>;
export type TUpdateVariantInput = z.infer<typeof updateVariantSchema>;
