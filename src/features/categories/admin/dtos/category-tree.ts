import { z } from 'zod';
import { categoryBaseDtoSchema, type TCategoryBaseDto } from '@/features/categories/common/dtos/category-base.ts';


export interface ICategoryTreeNodeDto extends TCategoryBaseDto {
  children: ICategoryTreeNodeDto[];
}

export const categoryTreeNodeDtoSchema: z.ZodType<ICategoryTreeNodeDto> = z.lazy(() =>
  categoryBaseDtoSchema.extend({
    children: z.array(categoryTreeNodeDtoSchema),
  })
);

export const categoryForestDtoSchema = z.array(categoryTreeNodeDtoSchema);

export function buildCategoryForest(
  categories: TCategoryBaseDto[],
  parentId: number | null = null,
): ICategoryTreeNodeDto[] {
  return categories
    .filter(c => c.parentId === parentId)
    .map(c => ({ ...c, children: buildCategoryForest(categories, c.id) }));
}
