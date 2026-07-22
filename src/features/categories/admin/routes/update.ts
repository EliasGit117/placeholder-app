import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase } from './base.ts';
import { categoryBaseDtoSchema } from '@/features/categories/common/dtos/category-base.ts';
import { updateCategoryDtoSchema } from '@/features/categories/admin/dtos/update-category.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';


const updateCategoryInputSchema = updateCategoryDtoSchema.extend({ id: z.number() });

export const adminCategoriesUpdate = categoriesAdminBase
  .route({
    method: 'PATCH',
    summary: 'Update category',
    description: 'Updates an existing category',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(updateCategoryInputSchema)
  .output(categoryBaseDtoSchema)
  .handler(async ({ input: { id, ...data }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.update(id, data);
  });
