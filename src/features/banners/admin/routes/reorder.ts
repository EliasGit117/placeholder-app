import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import { BannerService } from '@/features/banners/common/services/banner-service.ts';
import { BannerDtoFactory, bannerDtoSchema } from '@/features/banners/admin/dtos/banner.ts';

const reorderInputSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1),
});

export const adminBannersReorder = bannersAdminBase
  .route({
    method: 'PATCH',
    path: `${bannersAdminPath}/order`,
    summary: 'Reorder banners',
    description: 'Applies a new global display order for all banners',
  })
  .errors({ FORBIDDEN: {}, BAD_REQUEST: {} })
  .use(authMiddleware)
  .input(reorderInputSchema)
  .output(z.array(bannerDtoSchema))
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const banners = await BannerService.reorder(input.ids);
    return BannerDtoFactory.fromEntities(banners);
  });
