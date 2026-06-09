import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '../../services/banner-service.ts';
import { updateBannerDtoSchema } from '@/features/banners/dtos/update-banner.ts';
import { BannerDtoFactory, bannerDtoSchema } from '@/features/banners/dtos/banner.ts';

export const adminBannersUpdate = bannersAdminBase
  .route({
    method: 'PATCH',
    inputStructure: 'detailed',
    path: `${bannersAdminPath}/{id}`,
    summary: 'Update banner',
    description: 'Updates an existing banner',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({
    params: z.object({ id: z.coerce.number() }),
    body: updateBannerDtoSchema,
  }))
  .output(bannerDtoSchema)
  .handler(async ({ input: { params, body }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await BannerService.update(params.id, body);
    return BannerDtoFactory.fromEntity(result);
  });
