import { getLocale } from '@/paraglide/runtime';
import { categoryTreeRequestSchema } from '@/features/categories/public/dtos/category-tree-request.ts';
import {
  categoryForestSchema,
  CategoryDtoFactory,
} from '@/features/categories/public/dtos/category-node.ts';
import { categoriesBase, path } from './base.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';

export const getCategoriesTree = categoriesBase
  .route({
    method: 'GET',
    path: `${path}/tree`,
    summary: 'Get category tree',
    description: 'Returns the active category hierarchy as localized root trees, limited to the given depth (default 2)',
  })
  .meta({ anonymous: true })
  .input(categoryTreeRequestSchema)
  .output(categoryForestSchema)
  .handler(async ({ input }) => {
    const entities = await CategoryService.findAllActive();
    const locale = getLocale();

    return CategoryDtoFactory.buildForest(entities, locale, input.depth);
  });
