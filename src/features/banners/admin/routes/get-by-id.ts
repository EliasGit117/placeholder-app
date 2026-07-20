import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '@/features/banners/common/services/banner-service.ts';
import { BannerDtoFactory, bannerDtoSchema } from '@/features/banners/admin/dtos/banner.ts';

export const adminBannersGetById = bannersAdminBase
  .route({
    method: 'GET',
    path: `${bannersAdminPath}/{id}`,
    summary: 'Get banner by id',
    description: 'Returns a single banner by ID',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.coerce.number() }))
  .output(bannerDtoSchema)
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await BannerService.findById(id);
    if (result == null)
      throw errors.NOT_FOUND();

    return BannerDtoFactory.fromEntity(result);
  });
