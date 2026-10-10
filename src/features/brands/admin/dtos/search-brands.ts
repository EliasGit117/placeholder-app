import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { brandDtoSchema } from '@/features/brands/common/dtos/brand.ts';


const sortableFields = ['nameRo', 'nameRu', 'createdAt', 'updatedAt'] as const;

export const searchBrandsRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  nameRo: z.string().optional().catch(undefined),
  nameRu: z.string().optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchBrandsRequestDto = z.infer<typeof searchBrandsRequestDtoSchema>;

export const searchBrandsResultDtoSchema = paginationResultWithCountDtoSchema(brandDtoSchema);
