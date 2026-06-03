import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase } from './base.ts';
import { ProductService } from '../../services/product-service.ts';

export const adminProductsDelete = productsAdminBase
  .route({
    method: 'DELETE',
    summary: 'Delete product',
    description: 'Hard deletes a product and all of its variants.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number() }))
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['delete'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    await ProductService.delete(id);
  });
