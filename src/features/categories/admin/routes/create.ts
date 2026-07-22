import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase } from './base.ts';
import { categoryBaseDtoSchema } from '@/features/categories/common/dtos/category-base.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';
import { createCategoryDtoSchema } from '@/features/categories/admin/dtos/create-category.ts';


export const adminCategoriesCreate = categoriesAdminBase
  .route({
    method: 'POST',
    summary: 'Create category',
    description: 'Creates a new category',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(createCategoryDtoSchema)
  .output(categoryBaseDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['create'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.create(input);
  });
