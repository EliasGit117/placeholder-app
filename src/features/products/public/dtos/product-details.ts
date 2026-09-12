import { z } from 'zod';
import type { Product, ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema, optionValuesSchema } from '@/features/products/common/dtos/option-schema.ts';
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

// Localization happens in the query itself (only the requested locale's
// columns are selected), so these sources already carry a plain `name` /
// `shortDescription` / `description` rather than the bilingual `nameRo`/`nameRu` pairs.
type TProductDetailsSource = Pick<Product, 'id' | 'slug' | 'categoryId' | 'options'> & {
  name: string;
  shortDescription: string | null;
  description: string | null;
};

type TProductVariantDetailsSource = Pick<
  ProductVariant,
  'id' | 'fullSlug' | 'optionValues' | 'price' | 'discountPercent' | 'state'
> & { name: string };

export class ProductDetailsDtoFactory {

  static build(
    product: TProductDetailsSource,
    categoryName: string | null,
    variants: TProductVariantDetailsSource[],
    imagesByVariant: Map<number, TProductVariantImageDto[]>,
    selectedVariantId: number
  ): TProductDetailsDto {

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      categoryId: product.categoryId,
      category: categoryName,
      options: optionsSchema.safeParse(product.options).data ?? {},
      selectedVariantId: selectedVariantId,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
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
