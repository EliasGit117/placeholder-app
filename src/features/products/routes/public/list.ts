import { productsBase } from './base.ts';
import { productsSchema } from '@/features/products/schemas/product.ts';
import { ProductService } from '../../services/product-service.ts';

export const listProducts = productsBase
  .route({
    method: 'GET',
    summary: 'List products',
    description: 'Returns all active products',
  })
  .meta({ anonymous: true })
  .output(productsSchema)
  .handler(async () => {
    return ProductService.listActive();
  });
