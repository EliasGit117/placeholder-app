import { z } from 'zod';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';


const slugSchema = z.string().trim().min(1).max(128).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

export const createCategorySchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  descriptionRo: z.string().trim().max(512).optional(),
  descriptionRu: z.string().trim().max(512).optional(),
  state: z.enum(CategoryState).default(CategoryState.active),
  slug: slugSchema,
  parentId: z.number().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type TCreateCategoryInput = z.infer<typeof createCategorySchema>;
export type TUpdateCategoryInput = z.infer<typeof updateCategorySchema>;
