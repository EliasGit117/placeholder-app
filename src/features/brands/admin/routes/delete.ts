import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { brandsAdminBase, brandsAdminPath } from './base.ts';
import { BrandService } from '@/features/brands/common/services/brand-service.ts';

export const adminBrandsDelete = brandsAdminBase
  .route({
    method: 'DELETE',
    path: `${brandsAdminPath}/:id`,
    summary: 'Delete brand',
    description: 'Hard deletes a brand. Products assigned to it are kept and have their brand cleared.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number() }))
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { brands: ['delete'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    await BrandService.delete(id);
  });
