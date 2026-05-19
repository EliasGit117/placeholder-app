import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { createGallerySectionDtoSchema } from '@/features/gallery-sections/dtos/create-gallery-section.ts';
import { GallerySectionDtoFactory, gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';

export const adminGallerySectionsCreate = galleryAdminBase
  .route({
    method: 'POST',
    path: `${galleryAdminPath}/sections`,
    summary: 'Create gallery section',
    description: 'Creates a new gallery section',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(createGallerySectionDtoSchema)
  .output(gallerySectionDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const canCreate = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['create'] } },
    });

    if (!canCreate)
      errors.FORBIDDEN();

    const result = await GallerySectionService.create(input);
    return GallerySectionDtoFactory.fromEntity(result);
  });
