import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { z } from 'zod';
import { GallerySectionDtoFactory, gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';


export const adminGallerySectionsGetAll = galleryAdminBase
  .route({
    method: 'GET',
    path: `${galleryAdminPath}/sections`,
    summary: 'Get all gallery sections',
    description: 'Returns list of all gallery sections',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .output(z.array(gallerySectionDtoSchema))
  .handler(async ({ context: { user }, errors }) => {
    const canList = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['list'] } },
    });

    if (!canList)
      errors.FORBIDDEN();

    const items = await GallerySectionService.getAll();
    return GallerySectionDtoFactory.fromEntities(items);
  });
