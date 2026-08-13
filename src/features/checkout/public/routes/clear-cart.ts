import { checkoutBase, checkoutPath } from '@/features/checkout/public/routes/base.ts';
import { cartItemSchema, writeCart } from '@/features/checkout/common/lib/cart-cookie.ts';
import { z } from 'zod';

export const clearCart = checkoutBase
  .route({
    method: 'DELETE',
    path: `${checkoutPath}/cart`,
    summary: 'Clear cart',
    description: 'Empties the cart cookie',
  })
  .meta({ anonymous: true })
  .output(z.array(cartItemSchema))
  .handler(async ({ context: { resHeaders } }) => {
    writeCart(resHeaders, []);

    return [];
  });
