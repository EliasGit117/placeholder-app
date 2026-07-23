import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { productWithVariantsDtoSchema } from '@/features/products/common/dtos/product.ts';
import { ProductService } from '../../common/services/product-service.ts';

export const adminProductsGet = productsAdminBase
  .route({
    method: 'GET',
    path: `${productsAdminPath}/{id}`,
    summary: 'Get product by id',
    description: 'Returns a single product with its variants',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.coerce.number() }))
  .output(productWithVariantsDtoSchema)
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await ProductService.findById(id);
    if (result == null)
      throw errors.NOT_FOUND();

    return result;
  });
