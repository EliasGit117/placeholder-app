import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase, categoriesAdminPath } from './base.ts';
import {
  searchCategoriesRequestDtoSchema,
  searchCategoriesResultDtoSchema,
} from '@/features/categories/schemas/search-categories.ts';
import { CategoryService } from '../../services/category-service.ts';

export const adminCategoriesSearch = categoriesAdminBase
  .route({
    method: 'POST',
    path: `${categoriesAdminPath}/search`,
    summary: 'Search categories',
    description: 'Returns paginated list of categories',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(searchCategoriesRequestDtoSchema)
  .output(searchCategoriesResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.search(input);
  });
