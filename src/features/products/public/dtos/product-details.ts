import { z } from 'zod';
import type { Category, Product, ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema, optionValuesSchema, type TOptions } from '@/features/products/common/dtos/option-schema.ts';
import { productVariantImageDtoSchema, type TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';
import { computeDiscountedPrice } from '@/features/products/common/lib/discount.ts';

// A single purchasable variant on the product detail page: bilingual name is already
// resolved to the request locale, price is resolved to its discounted final price, and
// images carry everything the gallery needs.
export const productVariantDetailDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  optionValues: optionValuesSchema,
  price: z.number().int(),
  discountPercent: z.number().int().nullable(),
  finalPrice: z.number().int(),
  isAvailable: z.boolean(),
  images: z.array(productVariantImageDtoSchema),
});

export type TProductVariantDetailDto = z.infer<typeof productVariantDetailDtoSchema>;

// Full detail shape for the public product page. Unlike `productWithVariantsDtoSchema`
// (admin-facing, bilingual), this is pre-localized to the request locale like the rest
// of the public product DTOs, and carries every sibling variant so the page can switch
// between them (color/size pickers) without a refetch.
export const productDetailsDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  shortDescription: z.string().nullable(),
  description: z.string().nullable(),
  categoryId: z.number().nullable(),
  category: z.string().nullable(),
  options: optionsSchema,
  variants: z.array(productVariantDetailDtoSchema),
  selectedVariantId: z.number(),
});

export type TProductDetailsDto = z.infer<typeof productDetailsDtoSchema>;

export class ProductDetailsDtoFactory {

  static build(
    product: Product,
    category: Pick<Category, 'nameRo' | 'nameRu'> | null,
    variants: ProductVariant[],
    imagesByVariant: Map<number, TProductVariantImageDto[]>,
    ru: boolean,
    selectedVariantId: number
  ): TProductDetailsDto {
    return {
      id: product.id,
      name: ru ? product.nameRu : product.nameRo,
      slug: product.slug,
      shortDescription: (ru ? product.shortDescriptionRu : product.shortDescriptionRo) ?? null,
      description: (ru ? product.descriptionRu : product.descriptionRo) ?? null,
      categoryId: product.categoryId,
      category: (ru ? category?.nameRu : category?.nameRo) ?? null,
      options: product.options as TOptions,
      variants: variants.map((v) => ({
        id: v.id,
        name: ru ? v.nameRu : v.nameRo,
        slug: v.fullSlug,
        optionValues: v.optionValues as Record<string, string>,
        price: v.price,
        discountPercent: v.discountPercent,
        finalPrice: computeDiscountedPrice(v.price, v.discountPercent),
        isAvailable: v.state === ProductState.ACTIVE,
        images: imagesByVariant.get(v.id) ?? [],
      })),
      selectedVariantId,
    };
  }
}
