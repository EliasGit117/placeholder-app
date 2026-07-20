import { base } from '@/features/shared/orpc/base.ts';

export const bannersPublicTag = 'Banners';
export const bannersPublicPath = '/banners';

export const bannersPublicBase = base.route({
  tags: [bannersPublicTag],
  path: bannersPublicPath,
});
