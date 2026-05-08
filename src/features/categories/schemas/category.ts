import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const categoriesSchema = z.array(categorySchema);

export type TCategory = z.infer<typeof categorySchema>;
