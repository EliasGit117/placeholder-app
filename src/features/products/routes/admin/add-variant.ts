import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { addVariantSchema } from '@/features/products/schemas/product-variant-mutations.ts';
import { productVariantSchema } from '@/features/products/schemas/product-variant.ts';
import { ProductService } from '../../services/product-service.ts';

export const adminProductsAddVariant = productsAdminBase
  .route({
    method: 'POST',
    path: `${productsAdminPath}/variants`,
    summary: 'Add product variant',
    description: 'Adds a variant to an existing product',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(addVariantSchema)
  .output(productVariantSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.addVariant(input);
  });
