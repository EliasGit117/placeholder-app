import { base } from '@/features/shared/orpc/base.ts';

export const profileTag = 'Profile';
export const profilePath = '/profile';

export const profileBase = base.route({
  tags: [profileTag],
  path: profilePath,
});