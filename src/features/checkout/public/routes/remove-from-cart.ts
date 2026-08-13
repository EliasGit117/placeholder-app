import { checkoutBase, checkoutPath } from '@/features/checkout/public/routes/base.ts';
import { cartItemSchema, readCart, writeCart } from '@/features/checkout/common/lib/cart-cookie.ts';
import { z } from 'zod';

export const removeFromCart = checkoutBase
  .route({
    method: 'DELETE',
    path: `${checkoutPath}/cart/{id}`,
    summary: 'Remove a product from cart',
    description: 'Removes a product from the cart cookie',
  })
  .meta({ anonymous: true })
  .input(z.object({ id: z.coerce.number().int().nonnegative() }))
  .output(z.array(cartItemSchema))
  .handler(async ({ input, context: { headers, resHeaders } }) => {
    const next = readCart(headers).filter((item) => item.id !== input.id);

    writeCart(resHeaders, next);

    return next;
  });
