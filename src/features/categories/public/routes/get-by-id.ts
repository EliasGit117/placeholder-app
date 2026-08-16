import { z } from 'zod';
import { categoriesBase, path } from './base.ts';
import { categoryDetailsDtoSchema } from '@/features/categories/public/dtos/category-details.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';
import { getLocale } from '@/paraglide/runtime';

export const getCategoryById = categoriesBase
  .route({
    method: 'GET',
    path: `${path}/{id}`,
    summary: 'Get category by id',
    description: 'Returns the category localized for the request locale, with its ancestor chain from root to immediate parent',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ id: z.number() }))
  .output(categoryDetailsDtoSchema)
  .handler(async ({ input: { id }, errors }) => {
    const category = await CategoryService.findByIdWithAncestors(id, getLocale());
    if (category == null)
      throw errors.NOT_FOUND();

    return category;
  });
