import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase } from './base.ts';
import { createCategorySchema } from '@/features/categories/schemas/category-mutations.ts';
import { categorySchema } from '@/features/categories/schemas/category.ts';
import { CategoryService } from '../../services/category-service.ts';

export const adminCategoriesCreate = categoriesAdminBase
  .route({
    method: 'POST',
    summary: 'Create category',
    description: 'Creates a new category',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(createCategorySchema)
  .output(categorySchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['create'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.create(input);
  });
