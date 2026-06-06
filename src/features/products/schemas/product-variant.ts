import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionValuesSchema } from '@/features/products/schemas/option-schema.ts';
import { productVariantImageDtoSchema } from '@/features/products/dtos/product-variant-image.ts';


export const productVariantSchema = z.object({
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

export const productVariantsSchema = z.array(productVariantSchema);

export type TProductVariant = z.infer<typeof productVariantSchema>;
