import { checkoutBase, checkoutPath } from '@/features/checkout/public/routes/base.ts';
import { MAX_CART_ITEMS, cartItemSchema, readCart, writeCart } from '@/features/checkout/common/lib/cart-cookie.ts';
import { z } from 'zod';

export const addToCart = checkoutBase
  .route({
    method: 'POST',
    path: `${checkoutPath}/cart`,
    summary: 'Add a product to cart',
    description: 'Adds to a product\'s count in the cart cookie (delta can be negative to decrement); removes it once the count reaches 0',
  })
  .meta({ anonymous: true })
  .input(z.object({
    id: z.number().int().nonnegative(),
    count: z.number().int().default(1),
  }))
  .output(z.array(cartItemSchema))
  .handler(async ({ input, context: { headers, resHeaders } }) => {
    const current = readCart(headers);
    const existing = current.find((item) => item.id === input.id);
    const nextCount = (existing?.count ?? 0) + input.count;

    const next = nextCount <= 0 ?
      current.filter((item) => item.id !== input.id) :
      existing ?
        current.map((item) => item.id === input.id ? { ...item, count: nextCount } : item) :
        [{ id: input.id, count: nextCount }, ...current].slice(0, MAX_CART_ITEMS);

    writeCart(resHeaders, next);

    return next;
  });
