import { base } from '@/features/shared/orpc/base.ts';

export const ordersTag = 'Orders';
export const ordersPath = '/orders';

export const ordersBase = base.route({
  tags: [ordersTag],
  path: ordersPath,
});
