import { getLocale } from '@/paraglide/runtime';
import { categoryTreeRequestSchema } from 'src/features/categories/schemas/category.ts';
import {
  categoryPublicForestSchema,
  CategoryPublicDtoFactory,
} from '@/features/categories/dtos/category-public.ts';
import { categoriesBase, path } from './base.ts';
import { CategoryService } from '../../services/category-service.ts';

export const getCategoriesTree = categoriesBase
  .route({
    method: 'GET',
    path: `${path}/tree`,
    summary: 'Get category tree',
    description: 'Returns the active category hierarchy as localized root trees, limited to the given depth (default 2)',
  })
  .meta({ anonymous: true })
  .input(categoryTreeRequestSchema)
  .output(categoryPublicForestSchema)
  .handler(async ({ input }) => {
    const entities = await CategoryService.findAllActive();
    const locale = getLocale();

    return CategoryPublicDtoFactory.buildForest(entities, locale, input.depth);
  });
