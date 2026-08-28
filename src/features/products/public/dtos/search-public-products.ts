import { z } from 'zod';
import type { Prisma } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { computeDiscountedPrice } from '@/features/products/common/lib/discount.ts';
import { briefImageDtoSchema, type TBriefImageDto } from '@/features/products/common/dtos/brief-image.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '~/src/paraglide/runtime';


// A single sellable product on the public shop grid, already localized for the
// request's locale. `name` is the parent product name, `variantName` is the option
// (e.g. name = "iPhone 17 Pro Max", variantName = "Orange 128 gb").
export const briefProductPublicDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  variantName: z.string(),
  shortDescription: z.string().nullable(),
  price: z.number().int(),
  discountPercent: z.number().int().nullable(),
  finalPrice: z.number().int(),
  slug: z.string(),
  categoryId: z.number().nullable(),
  category: z.string().nullable(),
  image: briefImageDtoSchema.nullable(),
  isAvailable: z.boolean(),
});

export type TBriefProductPublicDto = z.infer<typeof briefProductPublicDtoSchema>;

const sortableFields = ['name', 'price', 'createdAt'] as const;

export const searchPublicProductsRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  categoryId: z.number().int().optional().catch(undefined),
  priceMin: z.number().int().min(0).optional().catch(undefined),
  priceMax: z.number().int().min(0).optional().catch(undefined),
});

export type TSearchPublicProductsRequestDto = z.infer<typeof searchPublicProductsRequestDtoSchema>;

export const searchPublicProductsResultDtoSchema = paginationResultWithCountDtoSchema(briefProductPublicDtoSchema);

// Shared shape for querying a variant + its parent product fields needed by
// BriefProductPublicDtoFactory. Exported so the service can pass it to `include`
// without duplicating the field list.
export const briefProductVariantInclude = {
  product: {
    select: {
      nameRo: true,
      nameRu: true,
      shortDescriptionRo: true,
      shortDescriptionRu: true,
      categoryId: true,
      category: { select: { nameRo: true, nameRu: true } },
    },
  },
} satisfies Prisma.ProductVariantInclude;

export type TBriefProductVariantRow = Prisma.ProductVariantGetPayload<{ include: typeof briefProductVariantInclude }>;

export class BriefProductPublicDtoFactory {

  static fromVariant(
    variant: TBriefProductVariantRow,
    image: TBriefImageDto | null,
    locale: Locale
  ): TBriefProductPublicDto {
    const category = variant.product.category?.[`name${capitalizeFirst(locale)}`];
    const shortDescription = variant.product[`shortDescription${capitalizeFirst(locale)}`];

    return {
      id: variant.id,
      name: variant.product[`name${capitalizeFirst(locale)}`],
      variantName: variant[`name${capitalizeFirst(locale)}`],
      shortDescription: shortDescription ?? null,
      price: variant.price,
      discountPercent: variant.discountPercent,
      finalPrice: computeDiscountedPrice(variant.price, variant.discountPercent),
      slug: variant.fullSlug,
      categoryId: variant.product.categoryId,
      category: category ?? null,
      image,
      isAvailable: variant.state === ProductState.ACTIVE,
    };
  }
}
