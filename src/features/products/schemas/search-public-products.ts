import { z } from 'zod';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';


// A single sellable product on the public shop grid, already localized for the
// request's locale (name = parent product + option, e.g. "iPhone 17 Pro Max Orange 128 gb").
export const briefProductPublicDtoSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.number().int(),
  slug: z.string(),
  categoryId: z.number().nullable(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
  thumbhash: z.string().nullable(),
});

export type TBriefProductPublicDto = z.infer<typeof briefProductPublicDtoSchema>;

const sortableFields = ['name', 'price', 'createdAt'] as const;

export const searchPublicProductsRequestDtoSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  name: z.string().optional().catch(undefined),
});

export type TSearchPublicProductsRequestDto = z.infer<typeof searchPublicProductsRequestDtoSchema>;

export const searchPublicProductsResultDtoSchema = paginationResultWithCountDtoSchema(briefProductPublicDtoSchema);
