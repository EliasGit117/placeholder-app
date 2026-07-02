import { z } from 'zod';
import type { Category } from '~/prisma/generated/prisma/client.ts';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '~/src/paraglide/runtime';


export interface ICategoryPublicNode {
  id: number;
  slug: string;
  path: string;
  name: string;
  description?: string | null;
  children: ICategoryPublicNode[];
}

export const categoryPublicNodeSchema: z.ZodType<ICategoryPublicNode> = z.lazy(() =>
  z.object({
    id: z.number(),
    slug: z.string(),
    path: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    children: z.array(categoryPublicNodeSchema),
  })
);

export const categoryPublicForestSchema = z.array(categoryPublicNodeSchema);
export type TCategoryPublicForest = z.infer<typeof categoryPublicForestSchema>;

export class CategoryPublicDtoFactory {

  static buildForest(
    entities: Category[],
    locale: Locale,
    maxDepth: number,
    parentId: number | null = null,
  ): ICategoryPublicNode[] {
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
