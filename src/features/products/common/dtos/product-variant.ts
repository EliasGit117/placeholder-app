import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionValuesSchema } from '@/features/products/common/dtos/option-schema.ts';
import { productVariantImageDtoSchema } from '@/features/products/common/dtos/product-variant-image.ts';


export const productVariantDtoSchema = z.object({
  id: z.number(),
  productId: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  state: z.enum(ProductState),
  slug: z.string(),
  fullSlug: z.string(),
  sku: z.string(),
  optionValues: optionValuesSchema,
  price: z.number().int(),
  images: z.array(productVariantImageDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productVariantDtosSchema = z.array(productVariantDtoSchema);

export type TProductVariantDto = z.infer<typeof productVariantDtoSchema>;
