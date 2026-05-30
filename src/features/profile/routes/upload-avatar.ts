import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
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
    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.AVATAR, resourceId: user.id },
    });

    const image = await ImageService.upload({
      file: input.file,
      resourceType: ImageResourceType.AVATAR,
      purpose: ImagePurpose.AVATAR_IMAGE,
      resourceId: user.id,
      fileName: `avatar-${user.id}`,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: image.url },
    });

    if (existing)
      await ImageService.delete(existing.id).catch(() => undefined);

    return { image: image.url };
  });
