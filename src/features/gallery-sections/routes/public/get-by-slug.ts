import { z } from 'zod';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';
import { getLocale } from '@/paraglide/runtime';
import { galleryPublicBase, galleryPublicPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { gallerySectionPublicDtoSchema, GallerySectionPublicDtoFactory } from '@/features/gallery-sections/dtos/gallery-section-public.ts';

export const publicGallerySectionsGetBySlug = galleryPublicBase
  .route({
    method: 'GET',
    path: `${galleryPublicPath}/sections/{slug}`,
    summary: 'Get gallery section by slug',
    description: 'Returns a single active gallery section with localized name and description',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ slug: z.string() }))
  .output(gallerySectionPublicDtoSchema)
  .handler(async ({ input: { slug }, errors }) => {
    const result = await GallerySectionService.findBySlug(slug);
    if (result == null || result.state !== GallerySectionState.active)
      errors.NOT_FOUND();

    const locale = getLocale();
    return GallerySectionPublicDtoFactory.fromEntity(result!, locale);
  });
