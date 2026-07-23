import { base } from '@/features/shared/orpc/base.ts';
import type { InferRouterInputs, InferRouterOutputs } from '@orpc/server';
import { categoriesRoutes } from '../../categories/public/routes';
import { sessionsPublicRoutes } from '@/features/sessions/public/routes';
import { sessionsAdminRoutes } from '@/features/sessions/admin/routes';
import { usersAdminRoutes } from '@/features/users/admin/routes';
import { categoriesAdminRoutes } from '@/features/categories/admin/routes';
import { profileRoutes } from '@/features/profile/admin/routes';
import { productsRoutes } from '@/features/products/public/routes';
import { productsAdminRoutes } from '@/features/products/admin/routes';
import { bannersPublicRoutes } from '@/features/banners/public/routes';
import { bannersAdminRoutes } from '@/features/banners/admin/routes';


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