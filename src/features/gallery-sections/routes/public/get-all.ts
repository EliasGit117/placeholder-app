import { z } from 'zod';
import { getLocale } from '@/paraglide/runtime';
import { galleryPublicBase, galleryPublicPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { gallerySectionPublicDtoSchema, GallerySectionPublicDtoFactory } from '@/features/gallery-sections/dtos/gallery-section-public.ts';

export const publicGallerySectionsGetAll = galleryPublicBase
  .route({
    method: 'GET',
    path: `${galleryPublicPath}/sections`,
    summary: 'List active gallery sections',
    description: 'Returns localized name and description for all active gallery sections',
  })
  .meta({ anonymous: true })
  .output(z.array(gallerySectionPublicDtoSchema))
  .handler(async () => {
    const locale = getLocale();
    const sections = await GallerySectionService.findAllActive();
    return GallerySectionPublicDtoFactory.fromEntities(sections, locale);
  });
