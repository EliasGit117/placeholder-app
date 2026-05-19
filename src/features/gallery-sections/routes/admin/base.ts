import { base } from '@/features/shared/orpc/base.ts';

export const galleryAdminTag = 'Admin Gallery';
export const galleryAdminPath = '/admin/gallery';

export const galleryAdminBase = base.route({
  tags: [galleryAdminTag],
  path: galleryAdminPath,
});
