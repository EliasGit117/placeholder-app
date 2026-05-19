import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { updateGallerySectionDtoSchema } from '@/features/gallery-sections/dtos/update-gallery-section.ts';
import { GallerySectionDtoFactory, gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';
import { z } from 'zod';


export const adminGallerySectionsUpdate = galleryAdminBase
  .route({
    method: 'PATCH',
    inputStructure: 'detailed',
    path: `${galleryAdminPath}/sections/{id}`,
    summary: 'Update gallery section',
    description: 'Updates an existing gallery section'
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({
    params: z.object({ id: z.coerce.number() }),
    body: updateGallerySectionDtoSchema
  }))
  .output(gallerySectionDtoSchema)
  .handler(async ({ input: { params, body }, context: { user }, errors }) => {
    const canUpdate = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['update'] } }
    });

    if (!canUpdate)
      errors.FORBIDDEN();

    const result = await GallerySectionService.update(params.id, body);
    return GallerySectionDtoFactory.fromEntity(result);
  });
