import { z } from 'zod';
import { ImageVariantKind } from '~/prisma/generated/prisma/enums.ts';
import { imageDtoSchema, type TImageDto } from '@/features/images/dtos/image-dto.ts';
import { imageVariantDtoSchema } from '@/features/images/dtos/image-variant-dto.ts';

// A gallery-section image carries the original plus a known set of thumbnails
// (see the GALLERY_SECTION_IMAGE policy in image-resource-map.ts), so we expose
// the variants as a typed map instead of the generic array. A given thumbnail
// may be absent (e.g. legacy rows), so each is optional.
export const gallerySectionImageDtoSchema = imageDtoSchema.omit({ variants: true }).extend({
  variants: z.object({
    thumb256: imageVariantDtoSchema.optional(),
    thumb512: imageVariantDtoSchema.optional(),
  }),
});

export type TGallerySectionImageDto = z.infer<typeof gallerySectionImageDtoSchema>;

export class GallerySectionImageDtoFactory {

  static fromImageDto(dto: TImageDto): TGallerySectionImageDto {
    return {
      ...dto,
      variants: {
        thumb256: findVariant(dto, ImageVariantKind.THUMB_256x256),
        thumb512: findVariant(dto, ImageVariantKind.THUMB_512x512),
      },
    };
  }

  static fromImageDtos(dtos: TImageDto[]): TGallerySectionImageDto[] {
    return dtos.map(GallerySectionImageDtoFactory.fromImageDto);
  }
}

function findVariant(dto: TImageDto, kind: ImageVariantKind) {
  return dto.variants.find((v) => v.kind === kind);
}
