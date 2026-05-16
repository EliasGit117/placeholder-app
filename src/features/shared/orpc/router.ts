import { base } from '@/features/shared/orpc/base.ts';
import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server';
import { todosRoutes } from '@/features/todos/routes';
import { categoriesRoutes } from '../../categories/routes/public';
import { sessionsPublicRoutes } from '@/features/sessions/routes/public';
import { sessionsAdminRoutes } from '@/features/sessions/routes/admin';
import { usersAdminRoutes } from '@/features/users/routes/admin';
import { categoriesAdminRoutes } from '@/features/categories/routes/admin';


export const orpcRouter = base.router({
  sessions: sessionsPublicRoutes,
  categories: categoriesRoutes,
  todos: todosRoutes,
  admin: {
    sessions: sessionsAdminRoutes,
    users: usersAdminRoutes,
    categories: categoriesAdminRoutes,
  }
});

export type TOrpcRouter = typeof orpcRouter;
export type TOrpcInputs = InferRouterInputs<TOrpcRouter>;
export type TOrpcOutputs = InferRouterOutputs<TOrpcRouter>;