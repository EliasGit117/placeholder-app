import { z } from 'zod';
import { attributesSchema } from '@/features/products/schemas/option-schema.ts';


export const productVariantSchema = z.object({
  id: z.number(),
  productId: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  slug: z.string(),
  fullSlug: z.string(),
  attributes: attributesSchema,
  price: z.number().int(),
  stock: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productVariantsSchema = z.array(productVariantSchema);

export type TProductVariant = z.infer<typeof productVariantSchema>;
