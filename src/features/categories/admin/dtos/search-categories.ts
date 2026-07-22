import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { categoryBaseDtoSchema, type TCategoryBaseDto } from '@/features/categories/common/dtos/category-base.ts';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';


const sortableFields = [
  'nameRo',
  'nameRu',
  'state',
  'slug',
  'createdAt',
  'updatedAt',
] as const satisfies readonly (keyof TCategoryBaseDto)[];

export const searchCategoriesRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  nameRo: z.string().optional().catch(undefined),
  state: z.enum(CategoryState).optional().catch(undefined),
  parentId: z.number().optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchCategoriesRequestDto = z.infer<typeof searchCategoriesRequestDtoSchema>;

export const searchCategoriesResultDtoSchema = paginationResultWithCountDtoSchema(categoryBaseDtoSchema);
