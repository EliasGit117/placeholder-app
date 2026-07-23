import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema } from '@/features/products/common/dtos/option-schema.ts';
import { productVariantDtoSchema } from '@/features/products/common/dtos/product-variant.ts';


// Lightweight variant summary for list views: identity + first thumbnail.
export const productVariantBriefDtoSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  imageUrl: z.string().nullable(),
  thumbhash: z.string().nullable(),
});

export type TProductVariantBriefDto = z.infer<typeof productVariantBriefDtoSchema>;

export const productDtoSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  shortDescriptionRo: z.string().nullable(),
  shortDescriptionRu: z.string().nullable(),
  state: z.enum(ProductState),
  slug: z.string(),
  options: optionsSchema,
  categoryId: z.number().nullable(),
  variants: z.array(productVariantBriefDtoSchema).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productDtosSchema = z.array(productDtoSchema);

export type TProductDto = z.infer<typeof productDtoSchema>;

export const productWithVariantsDtoSchema = productDtoSchema.extend({
  variants: z.array(productVariantDtoSchema),
});

export type TProductWithVariantsDto = z.infer<typeof productWithVariantsDtoSchema>;
