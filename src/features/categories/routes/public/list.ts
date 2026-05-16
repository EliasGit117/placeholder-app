import { ORPCError } from '@orpc/server';
import { authMiddleware } from 'src/lib/auth/middleware.ts';
import { auth } from 'src/lib/auth/server.ts';
import { categoriesSchema } from 'src/features/categories/schemas/category.ts';
import { categoriesBase } from './base.ts';
import { CategoryService } from '../../services/category-service.ts';

export const listCategories = categoriesBase
  .route({
    method: 'GET',
    summary: 'List categories',
    description: 'Fetch all categories'
  })
  .use(authMiddleware)
  .output(categoriesSchema)
  .errors({ FORBIDDEN: {} })
  .handler(async ({ context }) => {
    const permission = await auth.api.userHasPermission({
      headers: context.headers,
      body: { permissions: { categories: ['list'] } }
    });

    if (!permission.success)
      throw new ORPCError('FORBIDDEN');

    return CategoryService.list();
  });
