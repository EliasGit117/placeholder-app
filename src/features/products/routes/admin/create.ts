import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase } from './base.ts';
import { createProductSchema } from '@/features/products/schemas/product-mutations.ts';
import { productWithVariantsSchema } from '@/features/products/schemas/product.ts';
import { ProductService } from '../../services/product-service.ts';

export const adminProductsCreate = productsAdminBase
  .route({
    method: 'POST',
    summary: 'Create product',
    description: 'Creates a new product with one or more variants',
  })
  .errors({ FORBIDDEN: {}, BAD_REQUEST: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(createProductSchema)
  .output(productWithVariantsSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['create'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.create(input);
  });
