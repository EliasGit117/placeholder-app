import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { createBannerDtoSchema } from '@/features/banners/dtos/create-banner.ts';
import { BannerDtoFactory, bannerDtoSchema } from '@/features/banners/dtos/banner.ts';

export const adminBannersCreate = bannersAdminBase
  .route({
    method: 'POST',
    path: bannersAdminPath,
    summary: 'Create banner',
    description: 'Creates a new banner, appended to the end of the display order',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(createBannerDtoSchema)
  .output(bannerDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['create'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await BannerService.create(input);
    return BannerDtoFactory.fromEntity(result);
  });
