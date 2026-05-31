import { z } from 'zod';
import { GallerySectionState, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { getLocale } from '@/paraglide/runtime';
import { galleryPublicBase, galleryPublicPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { GallerySectionPublicDtoFactory, gallerySectionPublicDtoSchema } from '@/features/gallery-sections/dtos/gallery-section-public.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { GallerySectionImageDtoFactory, gallerySectionImageDtoSchema } from '@/features/gallery-sections/dtos/gallery-section-image.ts';

export const galleryWithImagesSchema = z.object({
  section: gallerySectionPublicDtoSchema,
  images: z.array(gallerySectionImageDtoSchema),
});

export type TGalleryWithImages = z.infer<typeof galleryWithImagesSchema>;

export const publicGallerySectionsGetWithImages = galleryPublicBase
  .route({
    method: 'GET',
    path: `${galleryPublicPath}/sections/{slug}/with-images`,
    summary: 'Get gallery section with images',
    description: 'Returns a single active gallery section with its localized details and images',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ slug: z.string() }))
  .output(galleryWithImagesSchema)
  .handler(async ({ input: { slug }, errors }) => {
    const entity = await GallerySectionService.findBySlug(slug);
    if (entity == null || entity.state !== GallerySectionState.active)
      errors.NOT_FOUND();

    const [images] = await Promise.all([
      ImageService.findByResource(ImageResourceType.GALLERY_SECTION, String(entity!.id)),
    ]);

    const locale = getLocale();
    return {
      section: GallerySectionPublicDtoFactory.fromEntity(entity!, locale),
      images: GallerySectionImageDtoFactory.fromImageDtos(images),
    };
  });
