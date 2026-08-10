import { productsBase, productsPath } from '@/features/products/public/routes/base.ts';
import {
  MAX_FAVORITES,
  readFavorites,
  writeFavorites,
} from '@/features/products/common/lib/favorites-cookie.ts';
import { z } from 'zod';

export const addToFavorites = productsBase
  .route({
    method: 'POST',
    path: `${productsPath}/favorites`,
    summary: 'Add a favorite product',
    description: 'Adds a product ID to the favorites cookie',
  })
  .meta({ anonymous: true })
  .input(z.object({ id: z.number().int().nonnegative() }))
  .output(z.array(z.number().int().nonnegative()))
  .handler(async ({ input, context: { headers, resHeaders } }) => {
    const current = readFavorites(headers);
    const next = current.includes(input.id)
      ? current
      : [input.id, ...current].slice(0, MAX_FAVORITES);

    writeFavorites(resHeaders, next);

    return next;
  });
