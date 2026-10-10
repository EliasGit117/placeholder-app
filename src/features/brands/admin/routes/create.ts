import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { brandsAdminBase, brandsAdminPath } from './base.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';
import { createBrandDtoSchema } from '@/features/brands/admin/dtos/create-brand.ts';
import { BrandDtoFactory, brandDtoSchema } from '@/features/brands/common/dtos/brand.ts';

export const adminBrandsCreate = brandsAdminBase
  .route({
    method: 'POST',
    path: brandsAdminPath,
    summary: 'Create brand',
    description: 'Creates a new brand. Fails if a brand with the same name exists.',
  })
  .errors({ FORBIDDEN: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(createBrandDtoSchema)
  .output(brandDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { brands: ['create'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await BrandService.create(input);
    return BrandDtoFactory.fromEntity(result);
  });
