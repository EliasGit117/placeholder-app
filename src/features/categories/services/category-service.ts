import { ORPCError } from '@orpc/server';
import { type Category, Prisma } from '~/prisma/generated/prisma/client.ts';
import { prisma } from '@/lib/db';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import type { TCategory, TCategoryTreeNode } from '@/features/categories/schemas/category.ts';
import type { TCreateCategoryInput, TUpdateCategoryInput } from '@/features/categories/schemas/category-mutations.ts';
import type { TSearchCategoriesRequestDto } from '@/features/categories/schemas/search-categories.ts';

export class CategoryService {

  static fromEntity(entity: Category): TCategory {
    return {
      id: entity.id,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      descriptionRo: entity.descriptionRo,
      descriptionRu: entity.descriptionRu,
      state: entity.state,
      slug: entity.slug,
      path: entity.path,
      parentId: entity.parentId,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static async getForest(): Promise<TCategoryTreeNode[]> {
    const all = await prisma.category.findMany({ orderBy: { nameRo: 'asc' } });
    const dtos = all.map(CategoryService.fromEntity);
    return buildForest(dtos, null);
  }

  static async list(opts?: { parentId?: number | null }): Promise<TCategory[]> {
    const where: Prisma.CategoryWhereInput = {};
    if (opts?.parentId !== undefined)
      where.parentId = opts.parentId;

    const entities = await prisma.category.findMany({ where, orderBy: { nameRo: 'asc' } });
    return entities.map(CategoryService.fromEntity);
  }

  static async findById(id: number): Promise<TCategory | null> {
    const entity = await prisma.category.findUnique({ where: { id } });
    return entity ? CategoryService.fromEntity(entity) : null;
  }

  static async search(input: TSearchCategoriesRequestDto) {
    const [items, meta] = await prisma.category
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true,
      });

    return PaginationResultDtoFactory.getWithCount(items.map(CategoryService.fromEntity), meta);
  }

  static async create(input: TCreateCategoryInput): Promise<TCategory> {
    const { slug } = input;
    const parentPath = input.parentId ? await getParentPath(input.parentId) : null;
    const path = buildPath(slug, parentPath);

    const entity = await prisma.category.create({
      data: {
        nameRo: input.nameRo,
        nameRu: input.nameRu,
        descriptionRo: input.descriptionRo ?? null,
        descriptionRu: input.descriptionRu ?? null,
        state: input.state,
        slug: slug,
        path: path,
        parentId: input.parentId ?? null,
      },
    });

    return CategoryService.fromEntity(entity);
  }

  static async update(id: number, input: TUpdateCategoryInput): Promise<TCategory> {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    const slugChanged = input.slug !== undefined && input.slug !== existing.slug;
    const parentIdChanged = input.parentId !== undefined && input.parentId !== existing.parentId;

    let slug = existing.slug;
    let path = existing.path;

    if (slugChanged || parentIdChanged) {
      slug = slugChanged ? input.slug! : existing.slug;

      const newParentId = parentIdChanged ? (input.parentId ?? null) : existing.parentId;
      const parentPath = newParentId ? await getParentPath(newParentId) : null;
      path = buildPath(slug, parentPath);
    }

    const entity = await prisma.category.update({
      where: { id },
      data: {
        ...(input.nameRo !== undefined && { nameRo: input.nameRo }),
        ...(input.nameRu !== undefined && { nameRu: input.nameRu }),
        ...(input.descriptionRo !== undefined && { descriptionRo: input.descriptionRo }),
        ...(input.descriptionRu !== undefined && { descriptionRu: input.descriptionRu }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.parentId !== undefined && { parentId: input.parentId }),
        slug,
        path,
      },
    });

    if (slugChanged || parentIdChanged)
      await CategoryService.updateDescendantPaths(id, path);

    return CategoryService.fromEntity(entity);
  }

  static async delete(id: number): Promise<void> {
    const hasChildren = await prisma.category.count({ where: { parentId: id } });
    if (hasChildren > 0)
      throw new ORPCError('CONFLICT', { message: 'Cannot delete a category that has subcategories' });

    const hasProducts = await prisma.product.count({ where: { categoryId: id } });
    if (hasProducts > 0)
      throw new ORPCError('CONFLICT', { message: 'Cannot delete a category that has assigned products' });

    await prisma.category.delete({ where: { id } });
  }

  private static async updateDescendantPaths(parentId: number, parentPath: string): Promise<void> {
    const children = await prisma.category.findMany({ where: { parentId } });
    for (const child of children) {
      const newPath = `${parentPath}/${child.slug}`;
      await prisma.category.update({ where: { id: child.id }, data: { path: newPath } });
      await CategoryService.updateDescendantPaths(child.id, newPath);
    }
  }
}


function buildForest(categories: TCategory[], parentId: number | null): TCategoryTreeNode[] {
  return categories
    .filter(c => c.parentId === parentId)
    .map(c => ({ ...c, children: buildForest(categories, c.id) }));
}

function buildPath(slug: string, parentPath: string | null): string {
  return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
}

async function getParentPath(parentId: number): Promise<string> {
  const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { path: true } });
  if (!parent)
    throw new ORPCError('NOT_FOUND', { message: `Parent category '${parentId}' not found` });

  return parent.path;
}

function getWhere(input: TSearchCategoriesRequestDto): Prisma.CategoryWhereInput {
  const where: Prisma.CategoryWhereInput = {};

  if (input.nameRo != null)
    where.nameRo = { contains: input.nameRo, mode: 'insensitive' };

  if (input.state != null)
    where.state = input.state;

  if (input.parentId != null)
    where.parentId = input.parentId;

  if (input.createdAt?.from != null || input.createdAt?.to != null) {
    where.createdAt = {};
    if (input.createdAt.from != null) where.createdAt.gte = input.createdAt.from;
    if (input.createdAt.to != null) where.createdAt.lte = input.createdAt.to;
  }

  if (input.updatedAt?.from != null || input.updatedAt?.to != null) {
    where.updatedAt = {};
    if (input.updatedAt.from != null) where.updatedAt.gte = input.updatedAt.from;
    if (input.updatedAt.to != null) where.updatedAt.lte = input.updatedAt.to;
  }

  return where;
}
