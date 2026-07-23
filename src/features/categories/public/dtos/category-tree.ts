import { z } from 'zod';
import type { Category } from '~/prisma/generated/prisma/client.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '@/paraglide/runtime';


export interface ICategoryNodeDto {
  id: number;
  slug: string;
  path: string;
  name: string;
  description?: string | null;
  children: ICategoryNodeDto[];
}

export const categoryNodeDtoSchema: z.ZodType<ICategoryNodeDto> = z.lazy(() =>
  z.object({
    id: z.number(),
    slug: z.string(),
    path: z.string(),
    name: z.string(),
    description: z.string().nullish(),
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
        children: this.buildForest(entities, locale, maxDepth - 1, c.id),
      }));
  }
}
