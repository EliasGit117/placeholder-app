import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase } from './base.ts';
import { updateProductDtoSchema } from '@/features/products/admin/dtos/product-mutations.ts';
import { productWithVariantsDtoSchema } from '@/features/products/common/dtos/product.ts';
import { ProductService } from '../../common/services/product-service.ts';

const updateProductInputSchema = updateProductDtoSchema.extend({ id: z.number() });

export const adminProductsUpdate = productsAdminBase
  .route({
    method: 'PATCH',
    summary: 'Update product',
    description: 'Updates a product. Slug or option-schema changes cascade to variant slugs.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(updateProductInputSchema)
  .output(productWithVariantsDtoSchema)
  .handler(async ({ input: { id, ...data }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.update(id, data);
  });
