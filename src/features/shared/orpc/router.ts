import { base } from '@/features/shared/orpc/base.ts';
import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server';
import { todosRoutes } from '@/features/todos/routes';
import { categoriesRoutes } from '@/features/categories/routes';
import { sessionsPublicRoutes } from '@/features/sessions/routes/public';
import { sessionsAdminRoutes } from '@/features/sessions/routes/admin';
import { usersAdminRoutes } from '@/features/users/routes/admin';


export const orpcRouter = base.router({
  sessions: sessionsPublicRoutes,
  categories: categoriesRoutes,
  todos: todosRoutes,
  admin: {
    sessions: sessionsAdminRoutes,
    users: usersAdminRoutes,
  }
});

export type TOrpcRouter = typeof orpcRouter;
export type TOrpcInputs = InferRouterInputs<TOrpcRouter>;
export type TOrpcOutputs = InferRouterOutputs<TOrpcRouter>;