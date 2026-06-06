import { z } from 'zod';
import { ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import { imageDtoSchema, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { imageVariantDtoSchema } from '@/features/images/dtos/image-variant-dto.ts';

// Variant fields safe to expose to clients — no storage key, size or timestamps.
const variantImageVariantSchema = imageVariantDtoSchema.pick({
  kind: true,
  url: true,
  width: true,
  height: true,
});

// A product-variant image carries the original plus a known set of thumbnails
// (see the PRODUCT_VARIANT_IMAGE policy in image-resource-map.ts), so we expose
// the variants as a typed map instead of the generic array. A given thumbnail
// may be absent (e.g. legacy rows), so each is optional.
//
// Only the rendering essentials are exposed: internal storage fields (key, size,
// mimeType, resource ownership, timestamps) are intentionally dropped.
export const productVariantImageDtoSchema = imageDtoSchema
  .pick({
    id: true,
    url: true,
    width: true,
    height: true,
    thumbhash: true,
    order: true,
  })
  .extend({
    variants: z.object({
      thumb256: variantImageVariantSchema.optional(),
      thumb512: variantImageVariantSchema.optional(),
    }),
  });

export type TProductVariantImageDto = z.infer<typeof productVariantImageDtoSchema>;

export class ProductVariantImageDtoFactory {

  static fromImageDto(dto: TImageDto): TProductVariantImageDto {
    return {
      id: dto.id,
      url: dto.url,
      width: dto.width,
      height: dto.height,
      thumbhash: dto.thumbhash,
      order: dto.order,
      variants: {
        thumb256: findVariant(dto, ImageVariantKind.THUMB_256x256),
        thumb512: findVariant(dto, ImageVariantKind.THUMB_512x512),
      },
    };
  }

  static fromImageDtos(dtos: TImageDto[]): TProductVariantImageDto[] {
    return dtos.map(ProductVariantImageDtoFactory.fromImageDto);
  }
}

function findVariant(dto: TImageDto, kind: ImageVariantKind) {
  const variant = dto.variants.find((v) => v.kind === kind);
  if (!variant)
    return undefined;

  return {
    kind: variant.kind,
    url: variant.url,
    width: variant.width,
    height: variant.height,
  };
}
