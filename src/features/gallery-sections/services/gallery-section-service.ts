import { ORPCError } from '@orpc/server';
import { Prisma } from '~/prisma/generated/prisma/client.ts';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { ImageService } from '@/features/images/services/image-service.ts';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { GallerySectionDtoFactory } from '@/features/gallery-sections/dtos/gallery-section.ts';
import type { TCreateGallerySectionDto } from '@/features/gallery-sections/dtos/create-gallery-section.ts';
import type { TUpdateGallerySectionDto } from '@/features/gallery-sections/dtos/update-gallery-section.ts';
import type { TSearchGallerySectionsRequestDto } from '@/features/gallery-sections/dtos/search-gallery-section.ts';
import type { GallerySection } from '~/prisma/generated/prisma/client.ts';


export class GallerySectionService {


  static async findById(id: number): Promise<GallerySection | null> {
    return prisma.gallerySection.findUnique({ where: { id } });
  }

  static async findBySlug(slug: string): Promise<GallerySection | null> {
    return prisma.gallerySection.findUnique({ where: { slug } });
  }

  static async getAll(): Promise<GallerySection[]> {
    return prisma.gallerySection.findMany();
  }

  static async create(input: TCreateGallerySectionDto): Promise<GallerySection> {
    try {
      return await prisma.gallerySection.create({
        data: {
          slug: input.slug,
          nameRo: input.nameRo,
          nameRu: input.nameRu,
          descriptionRo: input.descriptionRo ?? null,
          descriptionRu: input.descriptionRu ?? null,
          state: input.state
        }
      });
    } catch (error) {
      throw mapSlugConflict(error);
    }
  }

  static async update(id: number, input: TUpdateGallerySectionDto): Promise<GallerySection> {
    const existing = await prisma.gallerySection.findUnique({ where: { id: id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    try {
      return await prisma.gallerySection.update({
        where: { id: id },
        data: {
          ...(input.slug != null && { slug: input.slug }),
          ...(input.nameRo !== null && { nameRo: input.nameRo }),
          ...(input.nameRu !== null && { nameRu: input.nameRu }),
          ...(input.descriptionRo !== null && { descriptionRo: input.descriptionRo }),
          ...(input.descriptionRu !== null && { descriptionRu: input.descriptionRu }),
          ...(input.state !== null && { state: input.state })
        }
      });
    } catch (error) {
      throw mapSlugConflict(error);
    }
  }

  static async search(input: TSearchGallerySectionsRequestDto) {
    const [items, meta] = await prisma.gallerySection
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true,
      });

    return PaginationResultDtoFactory.getWithCount(GallerySectionDtoFactory.fromEntities(items), meta);
  }

  static async delete(id: number): Promise<void> {
    const existing = await prisma.gallerySection.findUnique({ where: { id } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    await ImageService.deleteAllForResource(ImageResourceType.GALLERY_SECTION, String(id));
    await prisma.gallerySection.delete({ where: { id } });
  }
}


function mapSlugConflict(error: unknown): unknown {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
    return new ORPCError('CONFLICT', { message: 'A gallery section with this slug already exists' });

  return error;
}

function getWhere(input: TSearchGallerySectionsRequestDto): Prisma.GallerySectionWhereInput {
  const where: Prisma.GallerySectionWhereInput = {};

  if (input.nameRo != null)
    where.nameRo = { contains: input.nameRo, mode: 'insensitive' };

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