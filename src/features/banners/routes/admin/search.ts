import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { bannersAdminBase, bannersAdminPath } from './base.ts';
import {
  searchBannersRequestDtoSchema,
  searchBannersResultDtoSchema,
} from '@/features/banners/dtos/search-banner.ts';
import { BannerService } from '../../services/banner-service.ts';

export const adminBannersSearch = bannersAdminBase
  .route({
    method: 'POST',
    path: `${bannersAdminPath}/search`,
    summary: 'Search banners',
    description: 'Returns paginated list of banners',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(searchBannersRequestDtoSchema)
  .output(searchBannersResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { banners: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return BannerService.search(input);
  });
