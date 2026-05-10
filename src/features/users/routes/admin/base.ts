import { base } from '@/features/shared/orpc/base.ts';

export const usersAdminTag = 'Admin Users';
export const usersAdminPath = '/admin/users';

export const usersAdminBase = base.route({
  tags: [usersAdminTag],
  path: usersAdminPath
});
