import { productsBase, productsPath } from '@/features/products/public/routes/base.ts';
import { readFavorites } from '@/features/products/common/lib/favorites-cookie.ts';
import { z } from 'zod';

export const getFavorites = productsBase
  .route({
    method: 'GET',
    path: `${productsPath}/favorites`,
    summary: 'Get favorite products',
    description: 'Returns the list of favorite product IDs from the favorites cookie',
  })
  .meta({ anonymous: true })
  .output(z.array(z.number().int().nonnegative()))
  .handler(async ({ context: { headers } }) => readFavorites(headers));
