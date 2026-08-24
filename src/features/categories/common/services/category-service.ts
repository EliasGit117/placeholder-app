import { ORPCError } from '@orpc/server';
import { type Category, Prisma } from '~/prisma/generated/prisma/client.ts';
import { prisma } from '@/lib/db';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '@/paraglide/runtime';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { MAX_CATEGORY_DEPTH } from '@/features/categories/common/consts.ts';
import type { TCategoryBaseDto } from '@/features/categories/common/dtos/category-base.ts';
import type { TSearchCategoriesRequestDto } from '@/features/categories/admin/dtos/search-categories.ts';
import type { TUpdateCategoryDto } from '@/features/categories/admin/dtos/update-category.ts';
import type { TCreateCategoryDto } from '@/features/categories/admin/dtos/create-category.ts';
import type { TCategoryAncestorDto, TCategoryDetailsDto } from '@/features/categories/public/dtos/category-details.ts';


export class CategoryService {

  static fromEntity(entity: Category): TCategoryBaseDto {
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

  static async findAllActive(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { state: 'ACTIVE' },
      orderBy: { nameRo: 'asc' },
    });
  }

  static async list(opts?: { parentId?: number | null }): Promise<TCategoryBaseDto[]> {
    const where: Prisma.CategoryWhereInput = {};
    if (opts?.parentId !== undefined)
      where.parentId = opts.parentId;

    const entities = await prisma.category.findMany({ where, orderBy: { nameRo: 'asc' } });
    return entities.map(CategoryService.fromEntity);
  }

  static async findById(id: number): Promise<TCategoryBaseDto | null> {
    const entity = await prisma.category.findUnique({ where: { id } });
    return entity ? CategoryService.fromEntity(entity) : null;
  }

  static async findByIdWithAncestors(id: number, locale: Locale): Promise<TCategoryDetailsDto | null> {
    const entity = await prisma.category.findUnique({ where: { id } });
    if (!entity)
      return null;

    const ancestors: TCategoryAncestorDto[] = [];
    let parentId = entity.parentId;

    while (parentId != null) {
      const parent: Category | null = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parent)
        break;

      ancestors.unshift({ id: parent.id, slug: parent.slug, name: parent[`name${capitalizeFirst(locale)}`] });
      parentId = parent.parentId;
    }

    return {
      id: entity.id,
      slug: entity.slug,
      name: entity[`name${capitalizeFirst(locale)}`],
      ancestors,
    };
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

  static async create(input: TCreateCategoryDto): Promise<TCategoryBaseDto> {
    const { slug } = input;
    const parentPath = input.parentId ? await getParentPath(input.parentId) : null;
    const path = buildPath(slug, parentPath);

    if (getPathDepth(path) > MAX_CATEGORY_DEPTH)
      throw new ORPCError('BAD_REQUEST', {
        message: `Category depth cannot exceed ${MAX_CATEGORY_DEPTH} levels.`,
      });

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

  static async update(id: number, input: TUpdateCategoryDto): Promise<TCategoryBaseDto> {
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

    if (parentIdChanged) {
      const maxDescendantDepth = await CategoryService.getMaxDescendantRelativeDepth(id);
      if (getPathDepth(path) + maxDescendantDepth > MAX_CATEGORY_DEPTH)
        throw new ORPCError('BAD_REQUEST', {
          message: `Category depth cannot exceed ${MAX_CATEGORY_DEPTH} levels.`,
        });
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

  // Deepest descendant chain below `id`, relative to `id` itself (no children = 0).
  private static async getMaxDescendantRelativeDepth(id: number): Promise<number> {
    const children = await prisma.category.findMany({ where: { parentId: id }, select: { id: true } });
    if (children.length === 0)
      return 0;

    const depths = await Promise.all(children.map((c) => CategoryService.getMaxDescendantRelativeDepth(c.id)));
    return 1 + Math.max(...depths);
  }
}


function buildPath(slug: string, parentPath: string | null): string {
  return parentPath ? `${parentPath}/${slug}` : `/${slug}`;
}

function getPathDepth(path: string): number {
  return path.split('/').filter(Boolean).length;
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
