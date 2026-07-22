import { base } from '@/features/shared/orpc/base.ts';

export const categoriesAdminTag = 'Admin Categories';
export const categoriesAdminPath = '/admin/categories';

export const categoriesAdminBase = base.route({
  tags: [categoriesAdminTag],
  path: categoriesAdminPath,
});
