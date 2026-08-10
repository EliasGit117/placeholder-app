import { productsBase, productsPath } from '@/features/products/public/routes/base.ts';
import { readFavorites, writeFavorites } from '@/features/products/common/lib/favorites-cookie.ts';
import { z } from 'zod';

export const removeFromFavorites = productsBase
  .route({
    method: 'DELETE',
    path: `${productsPath}/favorites/{id}`,
    summary: 'Remove a favorite product',
    description: 'Removes a product ID from the favorites cookie',
  })
  .meta({ anonymous: true })
  .input(z.object({ id: z.coerce.number().int().nonnegative() }))
  .output(z.array(z.number().int().nonnegative()))
  .handler(async ({ input, context: { headers, resHeaders } }) => {
    const next = readFavorites(headers).filter((id) => id !== input.id);

    writeFavorites(resHeaders, next);

    return next;
  });
