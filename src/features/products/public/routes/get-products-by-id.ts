import { productsBase, productsPath } from '@/features/products/public/routes/base.ts';
import { getProductsByIdRequestDtoSchema, productsByIdDtoSchema } from '@/features/products/public/dtos/get-products-by-id.ts';
import { ProductService } from '@/features/products/common/services/product-service.ts';

export const getProductsById = productsBase
  .route({
    method: 'POST',
    path: `${productsPath}/by-id`,
    summary: 'Get products by id',
    description: 'Returns active products for the given ids, keyed by id',
  })
  .meta({ anonymous: true })
  .input(getProductsByIdRequestDtoSchema)
  .output(productsByIdDtoSchema)
  .handler(async ({ input: { ids } }) => ProductService.getProductsByIds(ids));
