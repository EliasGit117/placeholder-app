import { z } from 'zod';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';
import { galleryPublicBase, galleryPublicPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { GallerySectionDtoFactory, gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';

export const publicGallerySectionsGetBySlug = galleryPublicBase
  .route({
    method: 'GET',
    path: `${galleryPublicPath}/sections/{slug}`,
    summary: 'Get gallery section by slug',
    description: 'Returns a single active gallery section by its slug',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ slug: z.string() }))
  .output(gallerySectionDtoSchema)
  .handler(async ({ input: { slug }, errors }) => {
    const result = await GallerySectionService.findBySlug(slug);
    if (result == null || result.state !== GallerySectionState.active)
      errors.NOT_FOUND();

    return GallerySectionDtoFactory.fromEntity(result!);
  });
