import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import {
  gallerySectionImageDtoSchema,
  GallerySectionImageDtoFactory,
} from '../../dtos/gallery-section-image.ts';
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
  .output(z.array(gallerySectionImageDtoSchema))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const section = await GallerySectionService.findById(input.sectionId);
    if (section == null)
      throw errors.NOT_FOUND();

    const images = await ImageService.findByResource(
      ImageResourceType.GALLERY_SECTION,
      String(input.sectionId)
    );

    return GallerySectionImageDtoFactory.fromImageDtos(images);
  });
