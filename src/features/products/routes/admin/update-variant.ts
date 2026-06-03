import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { updateVariantSchema } from '@/features/products/schemas/product-variant-mutations.ts';
import { productVariantSchema } from '@/features/products/schemas/product-variant.ts';
import { ProductService } from '../../services/product-service.ts';

export const adminProductsUpdateVariant = productsAdminBase
  .route({
    method: 'PATCH',
    path: `${productsAdminPath}/variants`,
    summary: 'Update product variant',
    description: 'Updates a variant. Attribute changes re-derive the variant slug.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(updateVariantSchema)
  .output(productVariantSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.updateVariant(input);
  });
