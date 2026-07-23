import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import { updateVariantDtoSchema } from '@/features/products/admin/dtos/product-variant-mutations.ts';
import { productVariantDtoSchema } from '@/features/products/common/dtos/product-variant.ts';
import { ProductService } from '../../common/services/product-service.ts';

export const adminProductsUpdateVariant = productsAdminBase
  .route({
    method: 'PATCH',
    path: `${productsAdminPath}/variants`,
    summary: 'Update product variant',
    description: 'Updates a variant. Attribute changes re-derive the variant slug.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(updateVariantDtoSchema)
  .output(productVariantDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.updateVariant(input);
  });
