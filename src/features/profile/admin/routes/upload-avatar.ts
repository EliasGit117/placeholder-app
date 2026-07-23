import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { ImageService } from '@/features/images/common/services/image-service.ts';
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
    // AVATAR_IMAGE is single-cardinality, so the new upload would be rejected
    // while the old image still exists. Replace by deleting the previous avatar
    // first, then uploading the new one.
    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.AVATAR, resourceId: user.id },
    });

    if (existing)
      await ImageService.delete(existing.id).catch((error) => {
        // Non-fatal: a stale previous avatar shouldn't block the new upload, but
        // it leaves an orphaned storage object, so surface it for cleanup.
        console.error('[Avatar] Failed to delete previous avatar before replace', {
          imageId: existing.id,
          userId: user.id,
          error,
        });
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

    return { image: image.url };
  });
