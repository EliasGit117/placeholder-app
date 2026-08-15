import { z } from 'zod';
import { productsBase, productsPath } from './base.ts';
import { productDetailsDtoSchema } from '@/features/products/public/dtos/product-details.ts';
import { ProductService } from '../../common/services/product-service.ts';

export const getProductBySlug = productsBase
  .route({
    method: 'GET',
    path: `${productsPath}/{slug}`,
    summary: 'Get product detail by variant slug',
    description: 'Returns the product for the given variant full-slug, with every sellable sibling variant',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ slug: z.string() }))
  .output(productDetailsDtoSchema)
  .handler(async ({ input: { slug }, errors }) => {
    const details = await ProductService.findDetailsByVariantSlug(slug);
    if (details == null)
      throw errors.NOT_FOUND();

    return details;
  });
