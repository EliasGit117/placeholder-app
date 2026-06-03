import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { productsAdminBase, productsAdminPath } from './base.ts';
import {
  searchProductsRequestDtoSchema,
  searchProductsResultDtoSchema,
} from '@/features/products/schemas/search-products.ts';
import { ProductService } from '../../services/product-service.ts';

export const adminProductsSearch = productsAdminBase
  .route({
    method: 'POST',
    path: `${productsAdminPath}/search`,
    summary: 'Search products',
    description: 'Returns paginated list of products',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(searchProductsRequestDtoSchema)
  .output(searchProductsResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { products: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return ProductService.search(input);
  });
