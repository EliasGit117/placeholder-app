import { getLocale } from '@/paraglide/runtime';
import { getCategoryTreeDtoSchema } from '@/features/categories/public/dtos/get-category-tree.ts';
import {
  categoryForestDtoSchema,
  CategoryDtoFactory,
} from '@/features/categories/public/dtos/category-tree.ts';
import { categoriesBase, path } from './base.ts';
import { CategoryService } from '@/features/categories/common/services/category-service.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { CategoryImageDtoFactory, type TCategoryImageDto } from '@/features/categories/common/dtos/category-image.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';


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

    const images = await ImageService.findByResources(
      ImageResourceType.CATEGORY,
      entities.map(e => String(e.id))
    );

    const imagesByCategoryId = new Map<number, TCategoryImageDto>(
      images
        .filter(img => img.resourceId != null)
        .map(img => [Number(img.resourceId), CategoryImageDtoFactory.fromImageDto(img)])
    );

    return CategoryDtoFactory.buildForest(entities, locale, input.depth, imagesByCategoryId);
  });
