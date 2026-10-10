import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { brandsAdminBase, brandsAdminPath } from './base.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';
import { BrandDtoFactory, brandDtosSchema } from '@/features/brands/common/dtos/brand.ts';

export const adminBrandsGetAll = brandsAdminBase
  .route({
    method: 'GET',
    path: `${brandsAdminPath}/all`,
    summary: 'Get all brands',
    description: 'Returns every brand sorted by name, for select inputs',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .output(brandDtosSchema)
  .handler(async ({ context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { brands: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return BrandDtoFactory.fromEntities(await BrandService.getAll());
  });
