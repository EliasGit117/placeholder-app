import { ORPCError } from '@orpc/server';
import { type Prisma, type ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ImageResourceType, ProductState } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import { getLocale } from '@/paraglide/runtime';
import { buildFullSlug } from '@/features/products/common/lib/slug.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { ProductVariantImageDtoFactory, type TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';
import { BriefImageDtoFactory, type TBriefImageDto } from '@/features/products/common/dtos/brief-image.ts';
import type { TxClient } from '@/lib/db/prisma.ts';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import type { TOptions, TOptionValues } from '@/features/products/common/dtos/option-schema.ts';
import { ProductDtoFactory, type TProductDto, type TProductVariantBriefDto, type TProductWithVariantsDto } from '@/features/products/common/dtos/product.ts';
import { ProductVariantDtoFactory, type TProductVariantDto } from '@/features/products/common/dtos/product-variant.ts';
import type { TCreateProductDto, TUpdateProductDto } from '@/features/products/admin/dtos/product-mutations.ts';
import type { TAddVariantDto, TUpdateVariantDto } from '@/features/products/admin/dtos/product-variant-mutations.ts';
import type { TSearchProductsRequestDto } from '@/features/products/admin/dtos/search-products.ts';
import { BriefProductPublicDtoFactory, briefProductVariantInclude } from '@/features/products/public/dtos/search-public-products.ts';
import type { TSearchPublicProductsRequestDto, TBriefProductPublicDto } from '@/features/products/public/dtos/search-public-products.ts';
import { ProductDetailsDtoFactory, type TProductDetailsDto } from '@/features/products/public/dtos/product-details.ts';

export class ProductService {

  // Batch-fetch images for the given variants, grouped by variant id, preserving
  // each variant's image display order.
  private static async variantImagesMap(
    variants: ProductVariant[]
  ): Promise<Map<number, TProductVariantImageDto[]>> {
    const images = await ImageService.findByResources(
      ImageResourceType.PRODUCT_VARIANT,
      variants.map((v) => String(v.id))
    );

    const map = new Map<number, TProductVariantImageDto[]>();
    for (const image of images) {
      const variantId = Number(image.resourceId);
      const list = map.get(variantId) ?? [];
      list.push(ProductVariantImageDtoFactory.fromImageDto(image));
      map.set(variantId, list);
    }

    return map;
  }

  // Batch-fetch the lead (display order) image per variant, converted to the
  // list/grid-friendly brief image shape (original + thumb size map).
  private static async firstImageByVariant(variantIds: number[]): Promise<Map<number, TBriefImageDto>> {
    const images = await ImageService.findByResources(
      ImageResourceType.PRODUCT_VARIANT,
      variantIds.map(String)
    );

    // findByResources is ordered by [resourceId, order], so the first hit per
    // variant is its lead image.
    const map = new Map<number, TBriefImageDto>();
    for (const img of images) {
      const variantId = Number(img.resourceId);
      if (map.has(variantId))
        continue;
      map.set(variantId, BriefImageDtoFactory.fromImageDto(img));
    }

    return map;
  }

  static async list(): Promise<TProductDto[]> {
    const entities = await prisma.product.findMany({ orderBy: { nameRo: 'asc' } });
    return entities.map((e) => ProductDtoFactory.fromEntity(e));
  }

  static async listActive(): Promise<TProductDto[]> {
    const entities = await prisma.product.findMany({
      where: { state: ProductState.ACTIVE },
      orderBy: { nameRo: 'asc' },
    });
    return entities.map((e) => ProductDtoFactory.fromEntity(e));
  }

  static async findById(id: number): Promise<TProductWithVariantsDto | null> {
    const entity = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (entity == null)
      return null;

    const imagesByVariant = await ProductService.variantImagesMap(entity.variants);
    return ProductDtoFactory.withVariants(entity, entity.variants, imagesByVariant);
  }

  static async findBySlug(slug: string): Promise<TProductWithVariantsDto | null> {
    const entity = await prisma.product.findUnique({ where: { slug }, include: { variants: true } });
    return entity ? ProductDtoFactory.withVariants(entity, entity.variants) : null;
  }

  // Public product-detail lookup: resolves by a variant's `fullSlug` (the URL shown
  // on the shop grid) and returns the parent product with every sellable sibling
  // variant, so the detail page can switch color/size without a refetch.
  static async findDetailsByVariantSlug(fullSlug: string): Promise<TProductDetailsDto | null> {
    const ru = getLocale() === 'ru';

    const variant = await prisma.productVariant.findUnique({
      where: { fullSlug },
      include: { product: { include: { category: { select: { nameRo: true, nameRu: true } } } } },
    });

    if (!variant || variant.product.state !== ProductState.ACTIVE)
      return null;
    if (variant.state !== ProductState.ACTIVE && variant.state !== ProductState.NOT_AVAILABLE)
      return null;

    const siblingVariants = await prisma.productVariant.findMany({
      where: {
        productId: variant.productId,
        state: { in: [ProductState.ACTIVE, ProductState.NOT_AVAILABLE] },
      },
      orderBy: { id: 'asc' },
    });

    const imagesByVariant = await ProductService.variantImagesMap(siblingVariants);

    return ProductDetailsDtoFactory.build(
      variant.product,
      variant.product.category,
      siblingVariants,
      imagesByVariant,
      ru,
      variant.id
    );
  }

  static async search(input: TSearchProductsRequestDto) {
    return ProductService.paginate(getWhere(input), input);
  }


  static async searchPublicProducts(input: TSearchPublicProductsRequestDto) {
    const ru = getLocale() === 'ru';

    const productWhere: Prisma.ProductWhereInput = { state: ProductState.ACTIVE };

    if (input.categoryId != null) {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
        select: { path: true },
      });

      if (category) {
        productWhere.category = {
          OR: [
            { path: category.path },
            { path: { startsWith: `${category.path}/` } },
          ],
        };
      }
    }

    const where: Prisma.ProductVariantWhereInput = {
      state: { in: [ProductState.ACTIVE, ProductState.NOT_AVAILABLE] },
      product: productWhere,
    };

    if (input.name != null) {
      // Display name = product name + variant name, so match either part.
      const filter = { contains: input.name, mode: 'insensitive' as const };
      where.OR = ru
        ? [{ nameRu: filter }, { product: { nameRu: filter } }]
        : [{ nameRo: filter }, { product: { nameRo: filter } }];
    }

    if (input.priceMin != null || input.priceMax != null) {
      where.price = {
        ...(input.priceMin != null && { gte: input.priceMin }),
        ...(input.priceMax != null && { lte: input.priceMax }),
      };
    }

    // 'name' sorts by the localized variant name; other keys map to real columns.
    const dir = input.dir ?? (input.sort === 'name' ? 'asc' : 'desc');
    // 'state' sorts before the chosen key so NOT_AVAILABLE variants ('not_available' > 'active') always trail ACTIVE ones.
    const orderBy: Prisma.ProductVariantOrderByWithRelationInput[] = [
      { state: 'asc' },
      input.sort === 'name' ? (ru ? { nameRu: dir } : { nameRo: dir })
        : input.sort === 'price' ? { price: dir }
          : { createdAt: dir },
    ];

    const [items, meta] = await prisma.productVariant
      .paginate({
        where,
        orderBy,
        include: briefProductVariantInclude,
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 8,
        includePageCount: true,
      });

    // Batch-load the lead image (display order) for every variant on the page.
    const firstImageByVariant = await ProductService.firstImageByVariant(items.map((v) => v.id));

    const result = items.map((v) =>
      BriefProductPublicDtoFactory.fromVariant(v, ru, firstImageByVariant.get(v.id) ?? null)
    );

    return PaginationResultDtoFactory.getWithCount(result, meta);
  }

  // Bulk lookup by variant id, keyed by id. Ids that don't resolve to an active
  // variant are simply absent from the result (no error).
  static async getProductsByIds(ids: number[]): Promise<Record<number, TBriefProductPublicDto>> {
    if (ids.length === 0)
      return {};

    const ru = getLocale() === 'ru';

    const items = await prisma.productVariant.findMany({
      where: {
        id: { in: ids },
        state: { in: [ProductState.ACTIVE, ProductState.NOT_AVAILABLE] },
        product: { state: ProductState.ACTIVE },
      },
      include: briefProductVariantInclude,
    });

    const firstImageByVariant = await ProductService.firstImageByVariant(items.map((v) => v.id));

    const result: Record<number, TBriefProductPublicDto> = {};
    for (const v of items) {
      result[v.id] = BriefProductPublicDtoFactory.fromVariant(v, ru, firstImageByVariant.get(v.id) ?? null);
    }

    return result;
  }

  private static async paginate(
    where: Prisma.ProductWhereInput,
    input: TSearchProductsRequestDto
  ) {
    const [items, meta] = await prisma.product
      .paginate({
        where,
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
        include: {
          variants: {
            select: { id: true, nameRo: true, nameRu: true },
            orderBy: { id: 'asc' },
          },
        },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true,
      });

    // Batch-load the first image (display order) for every variant on the page.
    const variantIds = items.flatMap((p) => p.variants.map((v) => v.id));
    const firstImageByVariant = await ProductService.firstImageByVariant(variantIds);

    const result = items.map((item) => {
      const variants: TProductVariantBriefDto[] = item.variants.map((v) => ({
        id: v.id,
        nameRo: v.nameRo,
        nameRu: v.nameRu,
        image: firstImageByVariant.get(v.id) ?? null,
      }));
      return ProductDtoFactory.fromEntity(item, variants);
    });

    return PaginationResultDtoFactory.getWithCount(result, meta);
  }

  static async create(input: TCreateProductDto): Promise<TProductWithVariantsDto> {
    // Products are created with basic fields only; options and variants are added afterwards.
    const product = await prisma.product.create({
      data: {
        nameRo: input.nameRo,
        nameRu: input.nameRu,
        shortDescriptionRo: input.shortDescriptionRo ?? null,
        shortDescriptionRu: input.shortDescriptionRu ?? null,
        descriptionRo: input.descriptionRo ?? null,
        descriptionRu: input.descriptionRu ?? null,
        state: input.state,
        slug: input.slug,
        options: (input.options ?? {}) as Prisma.InputJsonValue,
        categoryId: input.categoryId ?? null,
      },
      include: { variants: true },
    });

    return ProductDtoFactory.withVariants(product, product.variants);
  }

  static async addVariant(input: TAddVariantDto): Promise<TProductVariantDto> {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product)
      throw new ORPCError('NOT_FOUND', { message: `Product '${input.productId}' not found` });

    const options = product.options as TOptions;
    validatePartialOptionValues(options, input.optionValues);

    const slug = input.slug;
    const fullSlug = buildFullSlug(product.slug, slug);

    const existing = await prisma.productVariant.findFirst({ where: { productId: product.id, slug } });
    if (existing)
      throw new ORPCError('CONFLICT', { message: `A variant resolving to '${slug}' already exists` });

    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        nameRo: input.nameRo,
        nameRu: input.nameRu,
        state: input.state,
        sku: input.sku,
        slug,
        fullSlug,
        optionValues: input.optionValues as Prisma.InputJsonValue,
        price: input.price,
        discountPercent: input.discountPercent,
      },
    });

    return ProductVariantDtoFactory.fromEntity(variant);
  }

  static async updateVariant(input: TUpdateVariantDto): Promise<TProductVariantDto> {
    const existing = await prisma.productVariant.findUnique({
      where: { id: input.id },
      include: { product: true },
    });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    let slug = existing.slug;
    let fullSlug = existing.fullSlug;
    const slugChanged = input.slug !== undefined && input.slug !== existing.slug;

    if (input.optionValues !== undefined) {
      // Option values are user-supplied now too: validate them, but they no longer drive the slug.
      const options = existing.product.options as TOptions;
      validatePartialOptionValues(options, input.optionValues);
    }

    if (slugChanged) {
      slug = input.slug!;
      fullSlug = buildFullSlug(existing.product.slug, slug);

      const clash = await prisma.productVariant.findFirst({
        where: { productId: existing.productId, slug, id: { not: existing.id } },
      });
      if (clash)
        throw new ORPCError('CONFLICT', { message: `A variant with slug '${slug}' already exists` });
    }

    const variant = await prisma.productVariant.update({
      where: { id: input.id },
      data: {
        ...(input.nameRo !== undefined && { nameRo: input.nameRo }),
        ...(input.nameRu !== undefined && { nameRu: input.nameRu }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.optionValues !== undefined && { optionValues: input.optionValues as Prisma.InputJsonValue }),
        ...(slugChanged && { slug, fullSlug }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.discountPercent !== undefined && { discountPercent: input.discountPercent }),
      },
    });

    return ProductVariantDtoFactory.fromEntity(variant);
  }

  static async findVariantById(id: number): Promise<TProductVariantDto | null> {
    const entity = await prisma.productVariant.findUnique({ where: { id } });
    return entity ? ProductVariantDtoFactory.fromEntity(entity) : null;
  }

  static async deleteVariant(id: number): Promise<void> {
    const existing = await prisma.productVariant.findUnique({ where: { id }, select: { id: true } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    await prisma.productVariant.delete({ where: { id } });

    // Variant images are owned via the polymorphic image resource map (no FK
    // cascade), so clean them out of storage + DB after the variant is gone.
    await ImageService.deleteAllForResource(ImageResourceType.PRODUCT_VARIANT, String(id));
  }

  static async update(id: number, input: TUpdateProductDto): Promise<TProductWithVariantsDto> {
    const existing = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    const newSlug = input.slug ?? existing.slug;
    const newOptions = input.options ?? (existing.options as TOptions);
    const slugChanged = input.slug !== undefined && input.slug !== existing.slug;
    const optionsChanged =
      input.options !== undefined &&
      JSON.stringify(input.options) !== JSON.stringify(existing.options);

    // Variant slugs are user-controlled, so a product change never rewrites them. We only need to:
    // - rebuild each variant's fullSlug when the product slug changes;
    // - drop now-invalid optionValues when the options schema changes.
    const reconciled = (slugChanged || optionsChanged)
      ? existing.variants.map(variant => reconcileVariant(variant, newOptions, newSlug))
      : [];

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(input.nameRo !== undefined && { nameRo: input.nameRo }),
          ...(input.nameRu !== undefined && { nameRu: input.nameRu }),
          ...(input.shortDescriptionRo !== undefined && { shortDescriptionRo: input.shortDescriptionRo }),
          ...(input.shortDescriptionRu !== undefined && { shortDescriptionRu: input.shortDescriptionRu }),
          ...(input.descriptionRo !== undefined && { descriptionRo: input.descriptionRo }),
          ...(input.descriptionRu !== undefined && { descriptionRu: input.descriptionRu }),
          ...(input.state !== undefined && { state: input.state }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.options !== undefined && { options: input.options as Prisma.InputJsonValue }),
          ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
        },
      });

      if (slugChanged || optionsChanged) {
        for (const r of reconciled) {
          await tx.productVariant.update({
            where: { id: r.id },
            data: {
              slug: r.slug,
              fullSlug: r.fullSlug,
              optionValues: r.optionValues as Prisma.InputJsonValue,
            },
          });
        }
      }

      const variants = await tx.productVariant.findMany({ where: { productId: id } });
      return ProductDtoFactory.withVariants(product, variants);
    });
  }

  /**
   * Recomputes every variant's slug/fullSlug for the product's current slug. Used when only the
   * product slug changes (variant optionValues are untouched). Kept as a standalone, transaction-aware
   * helper to mirror CategoryService.updateDescendantPaths.
   */
  static async rebuildFullSlugsForProduct(tx: TxClient, productId: number): Promise<void> {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product)
      throw new ORPCError('NOT_FOUND');

    const variants = await tx.productVariant.findMany({ where: { productId } });
    for (const variant of variants) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { fullSlug: buildFullSlug(product.slug, variant.slug) },
      });
    }
  }

  static async delete(id: number): Promise<void> {
    const existing = await prisma.product.findUnique({
      where: { id },
      select: { variants: { select: { id: true } } },
    });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    await prisma.product.delete({ where: { id } });

    // Variant images are owned via the polymorphic image resource map (no FK cascade), so the
    // product-delete cascade only removes the ProductVariant rows — clean their images too.
    await Promise.all(
      existing.variants.map((v) =>
        ImageService.deleteAllForResource(ImageResourceType.PRODUCT_VARIANT, String(v.id))
      )
    );
  }
}


/** Strict validation used at product creation: every option must carry a valid value. */
export function validateOptionValues(options: TOptions, optionValues: TOptionValues): void {
  for (const [key, option] of Object.entries(options)) {
    const value = optionValues[key];
    if (value === undefined)
      throw new ORPCError('BAD_REQUEST', { message: `Missing value for option '${key}'` });
    if (!option.values.some(v => v.value === value))
      throw new ORPCError('BAD_REQUEST', { message: `Value '${value}' is not allowed for option '${key}'` });
  }

  for (const key of Object.keys(optionValues)) {
    if (!(key in options))
      throw new ORPCError('BAD_REQUEST', { message: `Unknown option '${key}'` });
  }
}

/**
 * Lenient validation for variant updates/additions: any provided value must reference a known option
 * and an allowed value, but a variant need not specify every option.
 */
export function validatePartialOptionValues(options: TOptions, optionValues: TOptionValues): void {
  for (const [key, value] of Object.entries(optionValues)) {
    const option = options[key];
    if (!option)
      throw new ORPCError('BAD_REQUEST', { message: `Unknown option '${key}'` });
    if (!option.values.some(v => v.value === value))
      throw new ORPCError('BAD_REQUEST', { message: `Value '${value}' is not allowed for option '${key}'` });
  }
}

interface IReconciledVariant {
  id: number;
  optionValues: TOptionValues;
  slug: string;
  fullSlug: string;
}

/**
 * Brings an existing variant in line with a (possibly changed) `options` definition and product slug.
 * The variant's own `slug` is user-controlled and never rewritten here; we only keep each option value
 * that still references a known option and an allowed value (dropping the rest) and rebuild `fullSlug`
 * from the product slug + the variant's existing slug.
 */
function reconcileVariant(
  variant: ProductVariant,
  options: TOptions,
  productSlug: string,
): IReconciledVariant {
  const current = variant.optionValues as TOptionValues;
  const next: TOptionValues = {};

  for (const [key, option] of Object.entries(options)) {
    const value = current[key];
    if (value !== undefined && option.values.some(v => v.value === value))
      next[key] = value;
  }

  return {
    id: variant.id,
    optionValues: next,
    slug: variant.slug,
    fullSlug: buildFullSlug(productSlug, variant.slug),
  };
}

function getWhere(input: TSearchProductsRequestDto): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {};

  if (input.nameRo != null)
    where.nameRo = { contains: input.nameRo, mode: 'insensitive' };

  if (input.nameRu != null)
    where.nameRu = { contains: input.nameRu, mode: 'insensitive' };

  if (input.state != null)
    where.state = { in: input.state };

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
