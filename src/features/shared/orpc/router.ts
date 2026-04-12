import { base } from '@/features/shared/orpc/base.ts';
import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server';
import { todosRoutes } from '@/features/todos/routes';


export const orpcRouter = base.router({
  todos: todosRoutes
});

export type TOrpcRouter = typeof orpcRouter;
export type TOrpcInputs = InferRouterInputs<TOrpcRouter>;
export type TOrpcOutputs = InferRouterOutputs<TOrpcRouter>;