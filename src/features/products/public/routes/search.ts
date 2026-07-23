import { productsBase, productsPath } from './base.ts';
import {
  searchPublicProductsRequestDtoSchema,
  searchPublicProductsResultDtoSchema,
} from '@/features/products/public/dtos/search-public-products.ts';
import { ProductService } from '../../common/services/product-service.ts';

export const searchProducts = productsBase
  .route({
    method: 'POST',
    path: `${productsPath}/search`,
    summary: 'Search products',
    description: 'Returns a paginated list of active products for the public shop',
  })
  .meta({ anonymous: true })
  .input(searchPublicProductsRequestDtoSchema)
  .output(searchPublicProductsResultDtoSchema)
  .handler(async ({ input }) => {
    return ProductService.searchPublicProducts(input);
  });
