import { productsBase } from './base.ts';
import { productDtosSchema } from '@/features/products/common/dtos/product.ts';
import { ProductService } from '../../common/services/product-service.ts';

export const listProducts = productsBase
  .route({
    method: 'GET',
    summary: 'List products',
    description: 'Returns all active products',
  })
  .meta({ anonymous: true })
  .output(productDtosSchema)
  .handler(async () => {
    return ProductService.listActive();
  });
