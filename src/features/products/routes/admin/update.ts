import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase } from './base.ts';
import { updateProductSchema } from '@/features/products/schemas/product-mutations.ts';
import { productWithVariantsSchema } from '@/features/products/schemas/product.ts';
import { ProductService } from '../../services/product-service.ts';

const updateProductInputSchema = updateProductSchema.extend({ id: z.number() });

export const adminProductsUpdate = productsAdminBase
  .route({
    method: 'PATCH',
    summary: 'Update product',
    description: 'Updates a product. Slug or option-schema changes cascade to variant slugs.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(updateProductInputSchema)
  .output(productWithVariantsSchema)
  .handler(async ({ input: { id, ...data }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.update(id, data);
  });
