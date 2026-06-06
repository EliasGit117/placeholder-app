import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase } from './base.ts';
import { CategoryService } from '../../services/category-service.ts';

export const adminCategoriesDelete = categoriesAdminBase
  .route({
    method: 'DELETE',
    summary: 'Delete category',
    description: 'Hard deletes a category. Fails if the category has subcategories or assigned products.',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, CONFLICT: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.number() }))
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['delete'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    await CategoryService.delete(id);
  });
