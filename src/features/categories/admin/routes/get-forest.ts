import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase, categoriesAdminPath } from './base.ts';
import { categoryForestDtoSchema } from '@/features/categories/common/dtos/category-tree.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';

export const adminCategoriesGetForest = categoriesAdminBase
  .route({
    method: 'GET',
    path: `${categoriesAdminPath}/forest`,
    summary: 'Get category forest',
    description: 'Returns the full category hierarchy as a list of root trees',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .output(categoryForestDtoSchema)
  .handler(async ({ context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.getForest();
  });
