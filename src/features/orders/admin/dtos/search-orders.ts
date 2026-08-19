import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { orderDtoSchema } from '@/features/orders/common/dtos/order.ts';
import { OrderStatus } from '~/prisma/generated/prisma/enums.ts';

const sortableFields = ['createdAt', 'updatedAt', 'totalPrice'] as const;

export const searchOrdersRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  status: z.array(z.enum(OrderStatus)).optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchOrdersRequestDto = z.infer<typeof searchOrdersRequestDtoSchema>;

export const searchOrdersResultDtoSchema = paginationResultWithCountDtoSchema(orderDtoSchema);
