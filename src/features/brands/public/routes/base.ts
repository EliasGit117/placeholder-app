import { base } from '@/features/shared/orpc/base.ts';

export const brandsTag = 'Brands';
export const brandsPath = '/brands';

export const brandsBase = base.route({
  tags: [brandsTag],
  path: brandsPath,
});
