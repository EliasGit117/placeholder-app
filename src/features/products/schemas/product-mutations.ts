import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { optionSchemaSchema } from '@/features/products/schemas/option-schema.ts';
import { createVariantSchema } from '@/features/products/schemas/product-variant-mutations.ts';


const slugSchema = z.string().trim().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

export const createProductSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  descriptionRo: z.string().trim().max(512).optional(),
  descriptionRu: z.string().trim().max(512).optional(),
  state: z.enum(ProductState).default(ProductState.active),
  slug: slugSchema,
  optionSchema: optionSchemaSchema,
  variants: z.array(createVariantSchema).min(1),
});

export const updateProductSchema = z.object({
  nameRo: z.string().trim().min(1).max(128).optional(),
  nameRu: z.string().trim().min(1).max(128).optional(),
  descriptionRo: z.string().trim().max(512).optional(),
  descriptionRu: z.string().trim().max(512).optional(),
  state: z.enum(ProductState).optional(),
  slug: slugSchema.optional(),
  optionSchema: optionSchemaSchema.optional(),
  // Values to backfill into existing variants for option keys newly added by this update.
  // Required (per key) whenever optionSchema gains a key while variants exist.
  backfill: z.record(z.string().trim().min(1), z.string().trim().min(1)).optional(),
});

export type TCreateProductInput = z.infer<typeof createProductSchema>;
export type TUpdateProductInput = z.infer<typeof updateProductSchema>;
