import { CategoryState } from '~/prisma/generated/prisma/enums.ts';
import { slugSchema } from '@/features/products/schemas/product-mutations.ts';
import { z } from 'zod';


export const createCategoryDtoSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  descriptionRo: z.string().trim().max(512).optional(),
  descriptionRu: z.string().trim().max(512).optional(),
  state: z.enum(CategoryState).default(CategoryState.ACTIVE),
  slug: slugSchema,
  parentId: z.number().optional(),
});

export type TCreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;
