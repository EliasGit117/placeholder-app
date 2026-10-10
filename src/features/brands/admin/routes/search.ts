import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { brandsAdminBase, brandsAdminPath } from './base.ts';
import { searchBrandsRequestDtoSchema, searchBrandsResultDtoSchema } from '@/features/brands/admin/dtos/search-brands.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';

export const adminBrandsSearch = brandsAdminBase
  .route({
    method: 'POST',
    path: `${brandsAdminPath}/search`,
    summary: 'Search brands',
    description: 'Returns paginated list of brands',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(searchBrandsRequestDtoSchema)
  .output(searchBrandsResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { brands: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return BrandService.search(input);
  });
