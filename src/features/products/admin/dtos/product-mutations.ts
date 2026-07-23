import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionsSchema } from '@/features/products/common/dtos/option-schema.ts';
import { slugSchema } from '@/features/shared/schemas/slug.ts';


// Shared shape of an editable product. create/update are both derived from this.
export const productBaseDtoSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  shortDescriptionRo: z.string().trim().max(4096).optional(),
  shortDescriptionRu: z.string().trim().max(4096).optional(),
  state: z.enum(ProductState).default(ProductState.ACTIVE),
  slug: slugSchema,
  options: optionsSchema,
  categoryId: z.number().int().positive().nullable().optional(),
});

// Creating a product takes only the basic fields; options and variants are added afterwards on the
// product details page via their own endpoints. `options` may be supplied but defaults to empty.
export const createProductDtoSchema = productBaseDtoSchema.extend({
  options: optionsSchema.optional(),
});

// Updating a product — every field optional; variants are managed via the variant endpoints.
export const updateProductDtoSchema = productBaseDtoSchema.partial();

export type TCreateProductDto = z.infer<typeof createProductDtoSchema>;
export type TUpdateProductDto = z.infer<typeof updateProductDtoSchema>;
