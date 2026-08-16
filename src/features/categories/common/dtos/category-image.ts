import { z } from 'zod';
import { ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import { imageDtoSchema, type TImageDto } from '@/features/images/common/dtos/image.ts';
import { imageVariantDtoSchema } from '@/features/images/common/dtos/image-variant.ts';

// Variant fields safe to expose to clients — no storage key, size or timestamps.
const categoryImageVariantSchema = imageVariantDtoSchema.pick({
  kind: true,
  url: true,
  width: true,
  height: true,
});

// A category image carries the original plus a known set of thumbnails (see
// the CATEGORY_IMAGE policy in image-resource-map.ts), so we expose the
// variants as a typed map instead of the generic array. A given thumbnail may
// be absent (e.g. legacy rows), so each is optional.
export const categoryImageDtoSchema = imageDtoSchema
  .pick({
    id: true,
    url: true,
    width: true,
    height: true,
    thumbhash: true,
  })
  .extend({
    variants: z.object({
      thumb256: categoryImageVariantSchema.optional(),
      thumb512: categoryImageVariantSchema.optional(),
      thumb1024: categoryImageVariantSchema.optional(),
    }),
  });

export type TCategoryImageDto = z.infer<typeof categoryImageDtoSchema>;

export class CategoryImageDtoFactory {

  static fromImageDto(dto: TImageDto): TCategoryImageDto {
    return {
      id: dto.id,
      url: dto.url,
      width: dto.width,
      height: dto.height,
      thumbhash: dto.thumbhash,
      variants: {
        thumb256: findVariant(dto, ImageVariantKind.THUMB_256x256),
        thumb512: findVariant(dto, ImageVariantKind.THUMB_512x512),
        thumb1024: findVariant(dto, ImageVariantKind.THUMB_1024x1024),
      },
    };
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
