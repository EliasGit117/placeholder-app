import { base } from '@/features/shared/orpc/base.ts';

export const brandsAdminTag = 'Admin Brands';
export const brandsAdminPath = '/admin/brands';

export const brandsAdminBase = base.route({
  tags: [brandsAdminTag],
  path: brandsAdminPath,
});
