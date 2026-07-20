import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { bannerDtoSchema } from '@/features/banners/admin/dtos/banner.ts';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';


const sortableFields = ['order', 'state', 'createdAt', 'updatedAt'] as const;

export const searchBannersRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  state: z.enum(BannerState).optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchBannersRequestDto = z.infer<typeof searchBannersRequestDtoSchema>;

export const searchBannersResultDtoSchema = paginationResultWithCountDtoSchema(bannerDtoSchema);
