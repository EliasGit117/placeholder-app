import { z } from 'zod';
import { GallerySectionState, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { galleryPublicBase, galleryPublicPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import {
  gallerySectionImageDtoSchema,
  GallerySectionImageDtoFactory
} from '@/features/gallery-sections/dtos/gallery-section-image.ts';


export const publicGallerySectionsGetImages = galleryPublicBase
  .route({
    method: 'GET',
    path: `${galleryPublicPath}/sections/{slug}/images`,
    summary: 'Get images for a public gallery section',
    description: 'Returns all images for an active gallery section identified by slug'
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ slug: z.string() }))
  .output(z.array(gallerySectionImageDtoSchema))
  .handler(async ({ input: { slug }, errors }) => {
    const section = await GallerySectionService.findBySlug(slug);
    if (section == null || section.state !== GallerySectionState.active)
      errors.NOT_FOUND();

    const images = await ImageService.findByResource(ImageResourceType.GALLERY_SECTION, String(section!.id));

    return GallerySectionImageDtoFactory.fromImageDtos(images);
  });
