import { z } from 'zod';
import type { ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionValuesSchema, type TOptionValues } from '@/features/products/common/dtos/option-schema.ts';
import { productVariantImageDtoSchema, type TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';


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
  discountPercent: z.number().int().nullable(),
  images: z.array(productVariantImageDtoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const productVariantDtosSchema = z.array(productVariantDtoSchema);

export type TProductVariantDto = z.infer<typeof productVariantDtoSchema>;

export class ProductVariantDtoFactory {

  static fromEntity(entity: ProductVariant, images: TProductVariantImageDto[] = []): TProductVariantDto {
    return {
      id: entity.id,
      productId: entity.productId,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      state: entity.state,
      sku: entity.sku,
      slug: entity.slug,
      fullSlug: entity.fullSlug,
      optionValues: entity.optionValues as TOptionValues,
      price: entity.price,
      discountPercent: entity.discountPercent,
      images,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
