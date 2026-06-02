import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { categoriesAdminBase } from './base.ts';
import { updateCategorySchema } from '@/features/categories/schemas/category-mutations.ts';
import { categorySchema } from '@/features/categories/schemas/category.ts';
import { CategoryService } from '../../services/category-service.ts';

const updateCategoryInputSchema = updateCategorySchema.extend({ id: z.number() });

export const adminCategoriesUpdate = categoriesAdminBase
  .route({
    method: 'PATCH',
    summary: 'Update category',
    description: 'Updates an existing category',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(updateCategoryInputSchema)
  .output(categorySchema)
  .handler(async ({ input: { id, ...data }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { categories: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return CategoryService.update(id, data);
  });
