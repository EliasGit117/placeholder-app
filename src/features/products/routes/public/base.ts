import { base } from '@/features/shared/orpc/base.ts';

export const productsTag = 'Products';
export const productsPath = '/products';

export const productsBase = base.route({
  tags: [productsTag],
  path: productsPath,
});
