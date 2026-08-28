import { z } from 'zod';
import type { Category, Product, ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema, optionValuesSchema } from '@/features/products/common/dtos/option-schema.ts';
import { productVariantImageDtoSchema, type TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';
import { computeDiscountedPrice } from '@/features/products/common/lib/discount.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '~/src/paraglide/runtime';

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
    selectedVariantId: number,
    locale: Locale
  ): TProductDetailsDto {

    return {
      id: product.id,
      name: product[`name${capitalizeFirst(locale)}`],
      slug: product.slug,
      shortDescription: product[`shortDescription${capitalizeFirst(locale)}`],
      description: product[`description${capitalizeFirst(locale)}`],
      categoryId: product.categoryId,
      category: category?.[`name${capitalizeFirst(locale)}`] ?? null,
      options: optionsSchema.safeParse(product.options).data ?? {},
      selectedVariantId: selectedVariantId,
      variants: variants.map((v) => ({
        id: v.id,
        name: v[`name${capitalizeFirst(locale)}`],
        slug: v.fullSlug,
        optionValues: optionValuesSchema.safeParse(v.optionValues).data ?? {},
        price: v.price,
        discountPercent: v.discountPercent,
        finalPrice: computeDiscountedPrice(v.price, v.discountPercent),
        isAvailable: v.state === ProductState.ACTIVE,
        images: imagesByVariant.get(v.id) ?? [],
      })),
    };
  }
}
