import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { ImageService } from '@/features/images/services/image-service.ts';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { profileBase, profilePath } from './base.ts';

const uploadAvatarInputSchema = z.object({
  file: z.instanceof(File),
});

const uploadAvatarOutputSchema = z.object({
  image: z.string(),
});

export const uploadAvatar = profileBase
  .route({
    method: 'POST',
    path: `${profilePath}/avatar`,
    summary: 'Upload current user avatar',
    description: 'Validates, transforms and stores the avatar, then updates the user record.',
  })
  .use(authMiddleware)
  .input(uploadAvatarInputSchema)
  .output(uploadAvatarOutputSchema)
  .handler(async ({ input, context: { user } }) => {
    const prepared = await ImageService.prepareFile({
      file: input.file,
      resourceType: ImageResourceType.AVATAR,
      purpose: ImagePurpose.THUMB_256x256,
    });

    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.AVATAR, resourceId: user.id },
    });

    const uploaded = await s3Storage.upload(prepared.file, { acl: 'public-read' });

    const image = await ImageService.create({
      url: uploaded.url,
      key: uploaded.key,
      size: uploaded.size,
      mimeType: prepared.mimeType,
      width: prepared.width,
      height: prepared.height,
      thumbhash: prepared.thumbhash,
      resourceType: ImageResourceType.AVATAR,
      resourceId: user.id,
      purpose: ImagePurpose.THUMB_256x256,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: uploaded.url },
    });

    if (existing) {
      await prisma.image.delete({ where: { id: existing.id } });
      await s3Storage.delete(existing.key).catch(() => undefined);
    }

    return { image: image.url };
  });
