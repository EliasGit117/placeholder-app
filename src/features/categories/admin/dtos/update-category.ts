import { z } from 'zod';
import { createCategoryDtoSchema } from './create-category';


export const updateCategoryDtoSchema = createCategoryDtoSchema.partial();

export type TUpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;

