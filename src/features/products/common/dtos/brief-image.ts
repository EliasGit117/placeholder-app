import { z } from 'zod';
import { ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import type { TImageDto } from '@/features/images/common/dtos/image.ts';

// Lightweight image shape for list/grid views: original + a typed thumb-size map, so
// each consumer can pick the size that fits its own layout instead of the backend
// guessing one preferred size for everyone.
const briefImageVariantSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  aspect: z.number(),
});

export const briefImageDtoSchema = z.object({
  url: z.string(),
  width: z.number(),
  height: z.number(),
  aspect: z.number(),
  thumbhash: z.string().nullable(),
  variants: z.object({
    thumb256: briefImageVariantSchema.optional(),
    thumb512: briefImageVariantSchema.optional(),
    thumb1024: briefImageVariantSchema.optional(),
  }),
});

export type TBriefImageDto = z.infer<typeof briefImageDtoSchema>;

export class BriefImageDtoFactory {

  static fromImageDto(dto: TImageDto): TBriefImageDto {
    return {
      url: dto.url,
      width: dto.width,
      height: dto.height,
      aspect: dto.width / dto.height,
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
    url: variant.url,
    width: variant.width,
    height: variant.height,
    aspect: variant.width / variant.height,
  };
}
