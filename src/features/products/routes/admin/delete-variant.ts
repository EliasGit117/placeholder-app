import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { ProductService } from '../../services/product-service.ts';

export const adminProductsDeleteVariant = productsAdminBase
  .route({
    method: 'DELETE',
    path: `${productsAdminPath}/variants`,
    summary: 'Delete product variant',
    description: 'Hard deletes a single variant. A product must keep at least one variant.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number() }))
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    await ProductService.deleteVariant(id);
  });
