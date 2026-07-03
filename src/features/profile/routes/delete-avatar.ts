import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { ImageService } from '@/features/images/services/image-service.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { profileBase, profilePath } from './base.ts';

const deleteAvatarOutputSchema = z.object({
  ok: z.literal(true),
});

export const deleteAvatar = profileBase
  .route({
    method: 'DELETE',
    path: `${profilePath}/avatar`,
    summary: 'Delete current user avatar',
    description: 'Clears the user avatar and removes the underlying image record and storage object.',
  })
  .use(authMiddleware)
  .output(deleteAvatarOutputSchema)
  .handler(async ({ context: { user } }) => {
    const existing = await prisma.image.findFirst({
      where: { resourceType: ImageResourceType.AVATAR, resourceId: user.id },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    if (existing)
      await ImageService.delete(existing.id).catch((error) => {
        // Non-fatal: the user record is already cleared, but a failed image
        // delete leaves an orphaned storage object, so surface it for cleanup.
        console.error('[Avatar] Failed to delete avatar image', {
          imageId: existing.id,
          userId: user.id,
          error,
        });
      });

    return { ok: true as const };
  });
