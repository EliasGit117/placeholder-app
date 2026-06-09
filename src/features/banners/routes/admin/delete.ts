import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';

export const adminBannersDelete = bannersAdminBase
  .route({
    method: 'DELETE',
    path: `${bannersAdminPath}/:id`,
    summary: 'Delete banner',
    description: 'Hard deletes a banner and its images, then resequences the order',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number() }))
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['delete'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    await BannerService.delete(id);
  });
