import { base } from '@/features/shared/orpc/base.ts';

export const checkoutTag = 'Checkout';
export const checkoutPath = '/checkout';

export const checkoutBase = base.route({
  tags: [checkoutTag],
  path: checkoutPath,
});
