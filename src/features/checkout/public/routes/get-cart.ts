import { checkoutBase, checkoutPath } from '@/features/checkout/public/routes/base.ts';
import { cartItemSchema, readCart } from '@/features/checkout/common/lib/cart-cookie.ts';
import { z } from 'zod';

export const getCart = checkoutBase
  .route({
    method: 'GET',
    path: `${checkoutPath}/cart`,
    summary: 'Get cart',
    description: 'Returns the cart items from the cart cookie',
  })
  .meta({ anonymous: true })
  .output(z.array(cartItemSchema))
  .handler(async ({ context: { headers } }) => readCart(headers));
