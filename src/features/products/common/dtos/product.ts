import { z } from 'zod';
import type { Product, ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema, type TOptions } from '@/features/products/common/dtos/option-schema.ts';
import { productVariantDtoSchema, ProductVariantDtoFactory } from '@/features/products/common/dtos/product-variant.ts';
import type { TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';
import { briefImageDtoSchema } from '@/features/products/common/dtos/brief-image.ts';


// Lightweight variant summary for list views: identity + first thumbnail.
export const productVariantBriefDtoSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  image: briefImageDtoSchema.nullable(),
});

export type TProductVariantBriefDto = z.infer<typeof productVariantBriefDtoSchema>;

export const productDtoSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  shortDescriptionRo: z.string().nullable(),
  shortDescriptionRu: z.string().nullable(),
  descriptionRo: z.string().nullable(),
  descriptionRu: z.string().nullable(),
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

export class ProductDtoFactory {

  static fromEntity(entity: Product, variants: TProductVariantBriefDto[] = []): TProductDto {
    return {
      id: entity.id,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      shortDescriptionRo: entity.shortDescriptionRo,
      shortDescriptionRu: entity.shortDescriptionRu,
      descriptionRo: entity.descriptionRo,
      descriptionRu: entity.descriptionRu,
      state: entity.state,
      slug: entity.slug,
      options: entity.options as TOptions,
      categoryId: entity.categoryId,
      variants,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static withVariants(
    product: Product,
    variants: ProductVariant[],
    imagesByVariant?: Map<number, TProductVariantImageDto[]>
  ): TProductWithVariantsDto {
    return {
      ...ProductDtoFactory.fromEntity(product),
      variants: variants.map((v) =>
        ProductVariantDtoFactory.fromEntity(v, imagesByVariant?.get(v.id) ?? [])
      ),
    };
  }
}
