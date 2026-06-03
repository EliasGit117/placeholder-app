import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionSchemaSchema } from '@/features/products/schemas/option-schema.ts';
import { productVariantSchema } from '@/features/products/schemas/product-variant.ts';


export const productSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  descriptionRo: z.string().nullable(),
  descriptionRu: z.string().nullable(),
  state: z.enum(ProductState),
  slug: z.string(),
  optionSchema: optionSchemaSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productsSchema = z.array(productSchema);

export type TProduct = z.infer<typeof productSchema>;

export const productWithVariantsSchema = productSchema.extend({
  variants: z.array(productVariantSchema),
});

export type TProductWithVariants = z.infer<typeof productWithVariantsSchema>;
