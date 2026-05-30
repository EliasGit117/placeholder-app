import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

const deleteImagesInputSchema = z.object({
  sectionId: z.number().int().positive(),
  ids: z.array(z.number().int().positive()).min(1),
});

export const adminGallerySectionsDeleteImages = galleryAdminBase
  .route({
    method: 'DELETE',
    path: `${galleryAdminPath}/sections/{sectionId}/images`,
    summary: 'Delete gallery section images',
    description: 'Removes the given images (and their variants) from a gallery section and storage',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(deleteImagesInputSchema)
  .output(z.object({ deleted: z.number() }))
  .handler(async ({ input, context: { user }, errors }) => {
    const canDelete = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['delete'] } },
    });

    if (!canDelete)
      errors.FORBIDDEN();

    const section = await GallerySectionService.findById(input.sectionId);
    if (section == null)
      errors.NOT_FOUND();

    const deleted = await ImageService.deleteManyForResource(
      ImageResourceType.GALLERY_SECTION,
      String(input.sectionId),
      input.ids
    );

    return { deleted };
  });
