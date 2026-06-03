import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { productsBase, productsPath } from './base.ts';
import { productWithVariantsSchema } from '@/features/products/schemas/product.ts';
import { ProductService } from '../../services/product-service.ts';

export const getProductBySlug = productsBase
  .route({
    method: 'GET',
    path: `${productsPath}/{slug}`,
    summary: 'Get product by slug',
    description: 'Returns a single active product with its variants',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ slug: z.string() }))
  .output(productWithVariantsSchema)
  .handler(async ({ input: { slug }, errors }) => {
    const product = await ProductService.findBySlug(slug);
    if (product == null || product.state !== ProductState.active)
      throw errors.NOT_FOUND();

    return product;
  });
