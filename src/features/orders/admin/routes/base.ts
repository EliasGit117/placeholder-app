import { base } from '@/features/shared/orpc/base.ts';

export const ordersAdminTag = 'Admin Orders';
export const ordersAdminPath = '/admin/orders';

export const ordersAdminBase = base.route({
  tags: [ordersAdminTag],
  path: ordersAdminPath,
});
