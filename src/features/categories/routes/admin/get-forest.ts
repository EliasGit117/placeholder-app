import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase, categoriesAdminPath } from './base.ts';
import { categoryForestSchema } from '@/features/categories/schemas/category.ts';
import { CategoryService } from '../../services/category-service.ts';

export const adminCategoriesGetForest = categoriesAdminBase
  .route({
    method: 'GET',
    path: `${categoriesAdminPath}/forest`,
    summary: 'Get category forest',
    description: 'Returns the full category hierarchy as a list of root trees',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .output(categoryForestSchema)
  .handler(async ({ context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.getForest();
  });
