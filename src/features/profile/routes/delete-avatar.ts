import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { s3Storage } from '@/features/shared/services/s3-storage.ts';
import { profileBase, profilePath } from './base.ts';

const deleteAvatarOutputSchema = z.object({
  ok: z.literal(true),
});

export const deleteAvatar = profileBase
  .route({
    method: 'DELETE',
    path: `${profilePath}/avatar`,
    summary: 'Delete current user avatar',
    description: 'Clears the user avatar and removes the underlying storage object.',
  })
  .use(authMiddleware)
  .output(deleteAvatarOutputSchema)
  .handler(async ({ context: { user } }) => {
    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { image: true },
    });

    const key = parseStorageKey(existing?.image ?? null);

    await prisma.user.update({
      where: { id: user.id },
      data: { image: null },
    });

    if (key)
      await s3Storage.delete(key).catch(() => undefined);

    return { ok: true as const };
  });

function parseStorageKey(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/f\/([^/?#]+)$/) ?? url.match(/\/([^/?#]+)$/);
  return match?.[1] ?? null;
}
