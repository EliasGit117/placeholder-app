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
      purpose: ImagePurpose.PRIMARY,
    });

    const uploaded = await s3Storage.upload(prepared.file, { acl: 'public-read' });

    const previousKey = await getPreviousAvatarKey(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { image: uploaded.url },
    });

    if (previousKey)
      await s3Storage.delete(previousKey).catch(() => undefined);

    return { image: uploaded.url };
  });

async function getPreviousAvatarKey(userId: string): Promise<string | null> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { image: true },
  });
  const url = existing?.image;
  if (!url) return null;

  const match = url.match(/\/f\/([^/?#]+)$/) ?? url.match(/\/([^/?#]+)$/);
  return match?.[1] ?? null;
}