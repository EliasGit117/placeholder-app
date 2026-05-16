import { z } from 'zod';
import { CategoryState } from '~/prisma/generated/prisma/enums.ts';


export const categorySchema = z.object({
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
});

export const categoriesSchema = z.array(categorySchema);

export type TCategory = z.infer<typeof categorySchema>;

export interface TCategoryTreeNode extends TCategory {
  children: TCategoryTreeNode[];
}

export const categoryTreeNodeSchema: z.ZodType<TCategoryTreeNode> = z.lazy(() =>
  categorySchema.extend({
    children: z.array(categoryTreeNodeSchema),
  })
);

export const categoryForestSchema = z.array(categoryTreeNodeSchema);
