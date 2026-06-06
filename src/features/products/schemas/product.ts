import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema } from '@/features/products/schemas/option-schema.ts';
import { productVariantSchema } from '@/features/products/schemas/product-variant.ts';


// Lightweight variant summary for list views: identity + first thumbnail.
export const productVariantBriefSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  imageUrl: z.string().nullable(),
  thumbhash: z.string().nullable(),
});

export type TProductVariantBrief = z.infer<typeof productVariantBriefSchema>;

export const productSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  shortDescriptionRo: z.string().nullable(),
  shortDescriptionRu: z.string().nullable(),
  state: z.enum(ProductState),
  slug: z.string(),
  options: optionsSchema,
  categoryId: z.number().nullable(),
  variants: z.array(productVariantBriefSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productsSchema = z.array(productSchema);

export type TProduct = z.infer<typeof productSchema>;

export const productWithVariantsSchema = productSchema.extend({
  variants: z.array(productVariantSchema),
});

export type TProductWithVariants = z.infer<typeof productWithVariantsSchema>;
