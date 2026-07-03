import { ORPCError } from '@orpc/server';
import { Prisma } from '~/prisma/generated/prisma/client.ts';
import type { Banner } from '~/prisma/generated/prisma/client.ts';
import { BannerState, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { prisma, type TxClient } from '@/lib/db';
import { ImageService } from '@/features/images/services/image-service.ts';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { BannerDtoFactory } from '@/features/banners/dtos/banner.ts';
import { bannerImagePurposeByLocaleDevice } from '@/features/banners/consts/banner-devices.ts';
import type { Locale } from '@/paraglide/runtime';
import type { TCreateBannerDto } from '@/features/banners/dtos/create-banner.ts';
import type { TUpdateBannerDto } from '@/features/banners/dtos/update-banner.ts';
import type { TSearchBannersRequestDto } from '@/features/banners/dtos/search-banner.ts';


const BANNER_LOCK = 'banners';

export class BannerService {

  static async findById(id: number): Promise<Banner | null> {
    return prisma.banner.findUnique({ where: { id } });
  }

  static async getAll(): Promise<Banner[]> {
    return prisma.banner.findMany({ orderBy: { order: 'asc' } });
  }

  static async findAllValid(locale: Locale): Promise<Banner[]> {
    // A banner is only public-valid for a locale once it has both of that
    // locale's device images: the desktop (3:1) and the mobile (6:5). Intersect
    // the resource ids that own each.
    const purposes = bannerImagePurposeByLocaleDevice[locale];
    const [desktopIds, mobileIds] = await Promise.all([
      ImageService.findResourceIdsWithImage(ImageResourceType.BANNER, purposes.desktop),
      ImageService.findResourceIdsWithImage(ImageResourceType.BANNER, purposes.mobile),
    ]);

    const mobileSet = new Set(mobileIds);
    const ids = desktopIds
      .filter((id) => mobileSet.has(id))
      .map((id) => Number(id))
      .filter((id) => Number.isInteger(id));

    if (ids.length === 0)
      return [];

    return prisma.banner.findMany({
      where: { state: BannerState.ACTIVE, id: { in: ids } },
      orderBy: { order: 'asc' }
    });
  }

  static async create(input: TCreateBannerDto): Promise<Banner> {
    // Appending the next order races against concurrent creates on the
    // `order` unique constraint, so serialize the max-lookup + insert under the
    // global banner lock (released on commit).
    return prisma.$transaction(async (tx) => {
      await BannerService.lock(tx);

      const last = await tx.banner.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true }
      });

      return tx.banner.create({
        data: {
          state: input.state,
          titleRo: input.titleRo ?? null,
          titleRu: input.titleRu ?? null,
          href: input.href ?? null,
          order: last ? last.order + 1 : 1
        }
      });
    });
  }

  static async update(id: number, input: TUpdateBannerDto): Promise<Banner> {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    return prisma.banner.update({
      where: { id },
      data: {
        ...(input.state !== undefined && { state: input.state }),
        ...(input.titleRo !== undefined && { titleRo: input.titleRo ?? null }),
        ...(input.titleRu !== undefined && { titleRu: input.titleRu ?? null }),
        ...(input.href !== undefined && { href: input.href ?? null })
      }
    });
  }

  static async search(input: TSearchBannersRequestDto) {
    const [items, meta] = await prisma.banner
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'order']: input.dir ?? 'asc' }
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true
      });

    return PaginationResultDtoFactory.getWithCount(BannerDtoFactory.fromEntities(items), meta);
  }

  static async delete(id: number): Promise<void> {
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    // Remove all of the banner's images (every locale + device, and their
    // storage objects) first, then drop the row and compact the remaining
    // banners to a gapless 1..N.
    await ImageService.deleteAllForResource(ImageResourceType.BANNER, String(id));

    await prisma.$transaction(async (tx) => {
      await BannerService.lock(tx);
      await tx.banner.delete({ where: { id } });
      await BannerService.resequence(tx);
    });
  }

  // Applies a new global display order. `orderedIds` must be the full current
  // set of banners (the new sequence); a stale/partial set is rejected so order
  // stays a gapless, unique 1..N.
  static async reorder(orderedIds: number[]): Promise<Banner[]> {
    await prisma.$transaction(async (tx) => {
      await BannerService.lock(tx);

      const existing = await tx.banner.findMany({ select: { id: true } });
      const existingIds = new Set(existing.map((e) => e.id));
      const uniqueIds = new Set(orderedIds);

      if (
        orderedIds.length !== existingIds.size ||
        uniqueIds.size !== orderedIds.length ||
        orderedIds.some((id) => !existingIds.has(id))
      )
        throw new ORPCError('BAD_REQUEST', {
          message: 'Provided ids must match all banners exactly.'
        });

      // A permutation can't be applied in place under the `order` unique index,
      // so park every row at a unique negative slot, then flip to the final
      // 1..N. Each phase is a single bulk statement.
      await BannerService.applyOrders(tx, orderedIds.map((id, i) => ({ id, order: -(i + 1) })));
      await BannerService.applyOrders(tx, orderedIds.map((id, i) => ({ id, order: i + 1 })));
    });

    return BannerService.getAll();
  }

  // Serializes every order mutation on a single global advisory lock; released
  // automatically when the transaction ends.
  private static async lock(tx: TxClient): Promise<void> {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${BANNER_LOCK}))`;
  }

  // Compacts orders to a gapless 1..N after a deletion. Caller must hold the
  // lock. Ascending updates are collision free because every new value shrinks.
  private static async resequence(tx: TxClient): Promise<void> {
    const remaining = await tx.banner.findMany({
      orderBy: { order: 'asc' },
      select: { id: true }
    });
    await BannerService.applyOrders(tx, remaining.map((row, i) => ({ id: row.id, order: i + 1 })));
  }

  // Sets an explicit `order` per id in one statement. Caller must hold the lock.
  // No-op on an empty list (an empty VALUES clause is a SQL syntax error).
  private static async applyOrders(
    tx: TxClient,
    pairs: { id: number; order: number }[]
  ): Promise<void> {
    if (pairs.length === 0)
      return;

    const rows = Prisma.join(pairs.map((p) => Prisma.sql`(${p.id}::int, ${p.order}::int)`));

    await tx.$executeRaw`
        UPDATE "banners" AS b
        SET "order" = v.ord FROM (VALUES ${rows}) AS v(id, ord)
        WHERE b.id = v.id
    `;
  }
}


function getWhere(input: TSearchBannersRequestDto): Prisma.BannerWhereInput {
  const where: Prisma.BannerWhereInput = {};

  if (input.state != null)
    where.state = input.state;

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
