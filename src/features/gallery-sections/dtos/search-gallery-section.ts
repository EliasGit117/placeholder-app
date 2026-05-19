import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { gallerySectionDtoSchema } from '@/features/gallery-sections/dtos/gallery-section.ts';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';


const sortableFields = ['nameRo', 'nameRu', 'state', 'createdAt', 'updatedAt'] as const;

export const searchGallerySectionsRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  nameRo: z.string().optional().catch(undefined),
  state: z.enum(GallerySectionState).optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchGallerySectionsRequestDto = z.infer<typeof searchGallerySectionsRequestDtoSchema>;

export const searchGallerySectionsResultDtoSchema = paginationResultWithCountDtoSchema(gallerySectionDtoSchema);