import { productsBase, productsPath } from '@/features/products/public/routes/base.ts';
import { writeFavorites } from '@/features/products/common/lib/favorites-cookie.ts';
import { z } from 'zod';

export const clearFavorites = productsBase
  .route({
    method: 'DELETE',
    path: `${productsPath}/favorites`,
    summary: 'Clear favorite products',
    description: 'Empties the favorites cookie',
  })
  .meta({ anonymous: true })
  .output(z.array(z.number().int().nonnegative()))
  .handler(async ({ context: { resHeaders } }) => {
    writeFavorites(resHeaders, []);

    return [];
  });
