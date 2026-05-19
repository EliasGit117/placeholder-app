import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { GallerySectionDtoFactory, gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';

export const adminGallerySectionsGetById = galleryAdminBase
  .route({
    method: 'GET',
    path: `${galleryAdminPath}/sections/{id}`,
    summary: 'Get by id gallery section',
    description: 'Returns a single gallery section by ID',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.coerce.number() }))
  .output(gallerySectionDtoSchema)
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const canGet = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['get'] } },
    });

    if (!canGet)
      errors.FORBIDDEN();

    const result = await GallerySectionService.findById(id);
    if (result == null)
      errors.NOT_FOUND();

    return GallerySectionDtoFactory.fromEntity(result!);
  });
