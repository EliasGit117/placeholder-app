import { getLocale } from '@/paraglide/runtime';
import { getCategoryTreeDtoSchema } from '@/features/categories/public/dtos/get-category-tree.ts';
import {
  categoryForestDtoSchema,
  CategoryDtoFactory,
} from '@/features/categories/public/dtos/category-tree.ts';
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
  .input(getCategoryTreeDtoSchema)
  .output(categoryForestDtoSchema)
  .handler(async ({ input }) => {
    const entities = await CategoryService.findAllActive();
    const locale = getLocale();

    return CategoryDtoFactory.buildForest(entities, locale, input.depth);
  });
