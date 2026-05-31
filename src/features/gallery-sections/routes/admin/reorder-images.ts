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

const reorderImagesInputSchema = z.object({
  sectionId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()).min(1),
});

export const adminGallerySectionsReorderImages = galleryAdminBase
  .route({
    method: 'PATCH',
    path: `${galleryAdminPath}/sections/{sectionId}/images/order`,
    summary: 'Reorder gallery section images',
    description: 'Applies a new display order for the images of a gallery section',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {} })
  .use(authMiddleware)
  .input(reorderImagesInputSchema)
  .output(z.array(gallerySectionImageDtoSchema))
  .handler(async ({ input, context: { user }, errors }) => {
    const canUpdate = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['update'] } },
    });

    if (!canUpdate)
      errors.FORBIDDEN();

    const section = await GallerySectionService.findById(input.sectionId);
    if (section == null)
      errors.NOT_FOUND();

    const images = await ImageService.reorderForResource(
      ImageResourceType.GALLERY_SECTION,
      String(input.sectionId),
      input.ids
    );

    return GallerySectionImageDtoFactory.fromImageDtos(images);
  });
