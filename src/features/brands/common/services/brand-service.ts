import { ORPCError } from '@orpc/server';
import { Prisma, type Brand } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { capitalizeFirst } from '@/lib/utils';
import type { Locale } from '@/paraglide/runtime';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { BrandDtoFactory } from '@/features/brands/common/dtos/brand.ts';
import type { TCreateBrandDto } from '@/features/brands/admin/dtos/create-brand.ts';
import type { TUpdateBrandDto } from '@/features/brands/admin/dtos/update-brand.ts';
import type { TSearchBrandsRequestDto } from '@/features/brands/admin/dtos/search-brands.ts';


export class BrandService {

  static async findById(id: number): Promise<Brand | null> {
    return prisma.brand.findUnique({ where: { id } });
  }

  static async getAll(): Promise<Brand[]> {
    return prisma.brand.findMany({ orderBy: { nameRo: 'asc' } });
  }

  // Public shop: only brands that would actually show products, sorted by the
  // locale's name.
  static async findAllWithActiveProducts(locale: Locale): Promise<Brand[]> {
    return prisma.brand.findMany({
      where: { products: { some: { state: ProductState.ACTIVE } } },
      orderBy: { [`name${capitalizeFirst(locale)}`]: 'asc' },
    });
  }

  static async search(input: TSearchBrandsRequestDto) {
    const [items, meta] = await prisma.brand
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'nameRo']: input.dir ?? 'asc' },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true,
      });

    return PaginationResultDtoFactory.getWithCount(BrandDtoFactory.fromEntities(items), meta);
  }

  static async create(input: TCreateBrandDto): Promise<Brand> {
    try {
      return await prisma.brand.create({
        data: { nameRo: input.nameRo, nameRu: input.nameRu },
      });
    } catch (error) {
      throw BrandService.mapWriteError(error);
    }
  }

  static async update(id: number, input: TUpdateBrandDto): Promise<Brand> {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    try {
      return await prisma.brand.update({
        where: { id },
        data: {
          ...(input.nameRo !== undefined && { nameRo: input.nameRo }),
          ...(input.nameRu !== undefined && { nameRu: input.nameRu }),
        },
      });
    } catch (error) {
      throw BrandService.mapWriteError(error);
    }
  }

  static async delete(id: number): Promise<void> {
    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    // Products keep existing: the FK is ON DELETE SET NULL, so they just lose the brand.
    await prisma.brand.delete({ where: { id } });
  }

  // Unique name violations surface as a CONFLICT instead of a generic 500.
  private static mapWriteError(error: unknown): unknown {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
      return new ORPCError('CONFLICT', { message: 'A brand with this name already exists' });

    return error;
  }
}


function getWhere(input: TSearchBrandsRequestDto): Prisma.BrandWhereInput {
  const where: Prisma.BrandWhereInput = {};

  if (input.nameRo != null)
    where.nameRo = { contains: input.nameRo, mode: 'insensitive' };

  if (input.nameRu != null)
    where.nameRu = { contains: input.nameRu, mode: 'insensitive' };

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
