import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { imageDtoSchema } from '@/features/images/dtos/image-dto.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

export const adminGallerySectionsGetImages = galleryAdminBase
  .route({
    method: 'GET',
    path: `${galleryAdminPath}/sections/{sectionId}/images`,
    summary: 'Get images for gallery section',
    description: 'Returns all images attached to a gallery section',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ sectionId: z.number().int().positive() }))
  .output(z.array(imageDtoSchema))
  .handler(async ({ input, context: { user }, errors }) => {
    const canGet = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['get'] } },
    });

    if (!canGet)
      errors.FORBIDDEN();

    const section = await GallerySectionService.findById(input.sectionId);
    if (section == null)
      errors.NOT_FOUND();

    return ImageService.findByResource(ImageResourceType.GALLERY_SECTION, input.sectionId);
  });
