import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { brandsAdminBase, brandsAdminPath } from './base.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';
import { BrandDtoFactory, brandDtoSchema } from '@/features/brands/common/dtos/brand.ts';

export const adminBrandsGetById = brandsAdminBase
  .route({
    method: 'GET',
    path: `${brandsAdminPath}/{id}`,
    summary: 'Get brand by id',
    description: 'Returns a single brand by ID',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.coerce.number() }))
  .output(brandDtoSchema)
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { brands: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await BrandService.findById(id);
    if (result == null)
      throw errors.NOT_FOUND();

    return BrandDtoFactory.fromEntity(result);
  });
