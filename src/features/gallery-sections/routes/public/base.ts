import { base } from '@/features/shared/orpc/base.ts';

export const galleryPublicTag = 'Gallery';
export const galleryPublicPath = '/gallery';

export const galleryPublicBase = base.route({
  tags: [galleryPublicTag],
  path: galleryPublicPath,
});
