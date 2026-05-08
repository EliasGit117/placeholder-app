import { base } from '@/features/shared/orpc/base.ts';

export const tag = 'Categories';
export const path = '/categories';

export const categoriesBase = base.route({
  tags: [tag],
  path
});
