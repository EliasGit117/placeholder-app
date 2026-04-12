import { base } from '@/features/shared/orpc/base.ts';

export const tag = 'Todos';
export const path = '/todos';

export const todosBase = base.route({
  tags: [tag],
  path: path
});
