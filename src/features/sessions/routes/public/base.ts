import { base } from '@/features/shared/orpc/base.ts';

export const sessionsPublicTag = 'Sessions';
export const sessionsPublicPath = '/sessions';

export const sessionsPublicBase = base.route({
  tags: [sessionsPublicTag],
  path: sessionsPublicPath
})