import { z } from 'zod';
import type { Category } from '~/prisma/generated/prisma/client.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '@/paraglide/runtime';
import { categoryImageDtoSchema, type TCategoryImageDto } from '@/features/categories/common/dtos/category-image.ts';


export interface ICategoryNodeDto {
  id: number;
  slug: string;
  path: string;
  name: string;
  description?: string | null;
  image: TCategoryImageDto | null;
  children: ICategoryNodeDto[];
}

export const categoryNodeDtoSchema: z.ZodType<ICategoryNodeDto> = z.lazy(() =>
  z.object({
    id: z.number(),
    slug: z.string(),
    path: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    image: categoryImageDtoSchema.nullable(),
    children: z.array(categoryNodeDtoSchema),
  })
);

export const categoryForestDtoSchema = z.array(categoryNodeDtoSchema);
export type TCategoryForestDto = z.infer<typeof categoryForestDtoSchema>;

export class CategoryDtoFactory {

  static buildForest(
    entities: Category[],
    locale: Locale,
    maxDepth: number,
    imagesByCategoryId: Map<number, TCategoryImageDto> = new Map(),
    parentId: number | null = null,
  ): ICategoryNodeDto[] {
    if (maxDepth < 1)
      return [];

    return entities
      .filter(c => c.parentId === parentId)
      .map(c => ({
        id: c.id,
        slug: c.slug,
        path: c.path,
        name: c[`name${capitalizeFirst(locale)}`],
        description: c[`description${capitalizeFirst(locale)}`] ?? undefined,
        image: imagesByCategoryId.get(c.id) ?? null,
        children: this.buildForest(entities, locale, maxDepth - 1, imagesByCategoryId, c.id),
      }));
  }
}
