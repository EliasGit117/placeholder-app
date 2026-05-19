import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';

export const adminGallerySectionsDelete = galleryAdminBase
  .route({
    method: 'DELETE',
    path: `${galleryAdminPath}/sections/:id`,
    summary: 'Delete gallery section',
    description: 'Hard deletes a gallery section',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number() }))
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const canDelete = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['delete'] } },
    });

    if (!canDelete)
      errors.FORBIDDEN();

    await GallerySectionService.delete(id);
  });
