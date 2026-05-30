import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
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

    if (existing) {
      await prisma.image.delete({ where: { id: existing.id } });
      await s3Storage.delete(existing.key).catch(() => undefined);
    }

    return { ok: true as const };
  });
