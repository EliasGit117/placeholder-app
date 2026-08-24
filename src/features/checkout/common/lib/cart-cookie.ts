import { z } from 'zod';
import { createCookieStore } from '@/features/shared/lib/cookie-store.ts';
import { MAX_ITEM_QUANTITY } from '@/features/checkout/common/consts.ts';

export const MAX_CART_ITEMS = 100;
export { MAX_ITEM_QUANTITY };

export const cartItemSchema = z.object({
  id: z.number().int().nonnegative(),
  count: z.number().int().positive().max(MAX_ITEM_QUANTITY),
});

export type TCartItem = z.infer<typeof cartItemSchema>;

const cartStore = createCookieStore('cart', z.array(cartItemSchema), []);

export const readCart = cartStore.read;
export const writeCart = cartStore.write;
