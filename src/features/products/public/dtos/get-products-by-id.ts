import { z } from 'zod';
import { briefProductPublicDtoSchema } from '@/features/products/public/dtos/search-public-products.ts';

export const getProductsByIdRequestDtoSchema = z.object({
  ids: z.array(z.number().int().nonnegative()).max(100),
});

export type TGetProductsByIdRequestDto = z.infer<typeof getProductsByIdRequestDtoSchema>;

// Missing/inactive ids are silently omitted rather than erroring, since callers
// (e.g. the favorites popover) look up ids from a client-side list that may
// reference products deleted or deactivated since being favorited.
export const productsByIdDtoSchema = z.record(z.coerce.number(), briefProductPublicDtoSchema);

export type TProductsByIdDto = z.infer<typeof productsByIdDtoSchema>;
