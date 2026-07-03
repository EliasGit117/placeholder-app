import { base } from '@/features/shared/orpc/base.ts';
import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server';
import { categoriesRoutes } from '../../categories/routes/public';
import { sessionsPublicRoutes } from '@/features/sessions/routes/public';
import { sessionsAdminRoutes } from '@/features/sessions/routes/admin';
import { usersAdminRoutes } from '@/features/users/routes/admin';
import { categoriesAdminRoutes } from '@/features/categories/routes/admin';
import { profileRoutes } from '@/features/profile/routes';
import { productsRoutes } from '@/features/products/routes/public';
import { productsAdminRoutes } from '@/features/products/routes/admin';
import { bannersPublicRoutes } from '@/features/banners/routes/public';
import { bannersAdminRoutes } from '@/features/banners/routes/admin';


export const orpcRouter = base.router({
  sessions: sessionsPublicRoutes,
  categories: categoriesRoutes,
  profile: profileRoutes,
  products: productsRoutes,
  banners: bannersPublicRoutes,
  admin: {
    sessions: sessionsAdminRoutes,
    users: usersAdminRoutes,
    categories: categoriesAdminRoutes,
    products: productsAdminRoutes,
    banners: bannersAdminRoutes
  }
});

export type TOrpcRouter = typeof orpcRouter;
export type TOrpcInputs = InferRouterInputs<TOrpcRouter>;
export type TOrpcOutputs = InferRouterOutputs<TOrpcRouter>;