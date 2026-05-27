import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { galleryAdminBase, galleryAdminPath } from './base.ts';
import { GallerySectionService } from '../../services/gallery-section-service.ts';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { imageDtoSchema } from '@/features/images/dtos/image-dto.ts';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';

const uploadImageInputSchema = z.object({
  sectionId: z.number().int().positive(),
  file: z.instanceof(File),
  purpose: z.enum(ImagePurpose),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export const adminGallerySectionsUploadImage = galleryAdminBase
  .route({
    method: 'POST',
    path: `${galleryAdminPath}/sections/{sectionId}/images`,
    summary: 'Upload image to gallery section',
    description: 'Uploads a file to storage and attaches the resulting image record to a gallery section',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(uploadImageInputSchema)
  .output(imageDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const canUpdate = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { gallerySections: ['update'] } },
    });

    if (!canUpdate)
      errors.FORBIDDEN();

    const section = await GallerySectionService.findById(input.sectionId);
    if (section == null)
      errors.NOT_FOUND();

    const uploaded = await s3Storage.upload(input.file, { acl: 'public-read' });

    return ImageService.create({
      url: uploaded.url,
      key: uploaded.key,
      size: uploaded.size,
      mimeType: input.file.type,
      width: input.width,
      height: input.height,
      resourceType: ImageResourceType.GALLERY_SECTION,
      resourceId: input.sectionId,
      purpose: input.purpose,
    });
  });
