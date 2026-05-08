import { base } from '@/features/shared/orpc/base.ts';

export const sessionsAdminTag = 'Admin/Sessions';
export const sessionsAdminPath = '/admin/sessions';

export const sessionsAdminBase = base.route({
  tags: [sessionsAdminTag],
  path: sessionsAdminPath
})