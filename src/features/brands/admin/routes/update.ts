import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { brandsAdminBase, brandsAdminPath } from './base.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';
import { updateBrandDtoSchema } from '@/features/brands/admin/dtos/update-brand.ts';
import { BrandDtoFactory, brandDtoSchema } from '@/features/brands/common/dtos/brand.ts';

export const adminBrandsUpdate = brandsAdminBase
  .route({
    method: 'PATCH',
    inputStructure: 'detailed',
    path: `${brandsAdminPath}/{id}`,
    summary: 'Update brand',
    description: 'Updates an existing brand. Fails if the new name collides with another brand.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(z.object({
    params: z.object({ id: z.coerce.number() }),
    body: updateBrandDtoSchema,
  }))
  .output(brandDtoSchema)
  .handler(async ({ input: { params, body }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { brands: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await BrandService.update(params.id, body);
    return BrandDtoFactory.fromEntity(result);
  });
