import { z } from 'zod';


export const getCategoryTreeDtoSchema = z.object({
  depth: z.number().int().min(1).max(10).default(2),
});

export type TGetCategoryTreeDto = z.infer<typeof getCategoryTreeDtoSchema>;
