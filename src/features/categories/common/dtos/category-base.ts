import { z } from 'zod';
import type { Category } from '~/prisma/generated/prisma/client.ts';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';


type TCategoryEntityDtoShape = Omit<Category, 'parent' | 'children' | 'products' | 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export const categoryBaseDtoSchema = z.object({
  id: z.number(),
  nameRo: z.string(),
  nameRu: z.string(),
  descriptionRo: z.string().nullable(),
  descriptionRu: z.string().nullable(),
  state: z.enum(CategoryState),
  slug: z.string(),
  path: z.string(),
  parentId: z.number().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<TCategoryEntityDtoShape>;

export const categoryBaseDtosSchema = z.array(categoryBaseDtoSchema);

export type TCategoryBaseDto = z.infer<typeof categoryBaseDtoSchema>;
