import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { productSchema } from '@/features/products/schemas/product.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';


const sortableFields = ['nameRo', 'nameRu', 'state', 'slug', 'createdAt', 'updatedAt'] as const;

export const searchProductsRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  nameRo: z.string().optional().catch(undefined),
  nameRu: z.string().optional().catch(undefined),
  state: z.array(z.enum(ProductState)).optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchProductsRequestDto = z.infer<typeof searchProductsRequestDtoSchema>;

export const searchProductsResultDtoSchema = paginationResultWithCountDtoSchema(productSchema);
