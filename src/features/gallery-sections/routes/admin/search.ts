import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import {
  searchGallerySectionsRequestDtoSchema,
  searchGallerySectionsResultDtoSchema,
} from '@/features/gallery-sections/dtos/search-gallery-section.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';

export const adminGallerySectionsSearch = galleryAdminBase
  .route({
    method: 'POST',
    path: `${galleryAdminPath}/sections/search`,
    summary: 'Search gallery sections',
    description: 'Returns paginated list of gallery sections',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(searchGallerySectionsRequestDtoSchema)
  .output(searchGallerySectionsResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const canList = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['list'] } },
    });

    if (!canList)
      errors.FORBIDDEN();

    return GallerySectionService.search(input);
  });