import { base } from '@/features/shared/orpc/base.ts';

export const productsAdminTag = 'Admin Products';
export const productsAdminPath = '/admin/products';

export const productsAdminBase = base.route({
  tags: [productsAdminTag],
  path: productsAdminPath,
});
