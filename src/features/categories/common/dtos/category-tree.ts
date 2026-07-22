import { z } from 'zod';
import { categoryBaseDtoSchema, type TCategoryBaseDto } from './category-base.ts';


export interface TCategoryTreeNodeDto extends TCategoryBaseDto {
  children: TCategoryTreeNodeDto[];
}

export const categoryTreeNodeDtoSchema: z.ZodType<TCategoryTreeNodeDto> = z.lazy(() =>
  categoryBaseDtoSchema.extend({
    children: z.array(categoryTreeNodeDtoSchema),
  })
);

export const categoryForestDtoSchema = z.array(categoryTreeNodeDtoSchema);
