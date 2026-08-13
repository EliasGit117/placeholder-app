import { z } from 'zod';
import { createCookieStore } from '@/features/shared/lib/cookie-store.ts';

export const MAX_CART_ITEMS = 100;

export const cartItemSchema = z.object({
  id: z.number().int().nonnegative(),
  count: z.number().int().positive(),
});

export type TCartItem = z.infer<typeof cartItemSchema>;

const cartStore = createCookieStore('cart', z.array(cartItemSchema), []);

export const readCart = cartStore.read;
export const writeCart = cartStore.write;
