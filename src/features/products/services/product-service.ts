import { ORPCError } from '@orpc/server';
import { type Prisma, type Product, type ProductVariant } from '~/prisma/generated/prisma/client.ts';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { prisma } from '@/lib/db';
import type { TxClient } from '@/lib/db/prisma.ts';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import type { TOptions, TOptionValues } from '@/features/products/schemas/option-schema.ts';
import type { TProduct, TProductWithVariants } from '@/features/products/schemas/product.ts';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';
import type { TCreateProductInput, TUpdateProductInput } from '@/features/products/schemas/product-mutations.ts';
import type { TAddVariantInput, TUpdateVariantInput } from '@/features/products/schemas/product-variant-mutations.ts';
import type { TSearchProductsRequestDto } from '@/features/products/schemas/search-products.ts';

export class ProductService {

  static fromEntity(entity: Product): TProduct {
    return {
      id: entity.id,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      shortDescriptionRo: entity.shortDescriptionRo,
      shortDescriptionRu: entity.shortDescriptionRu,
      state: entity.state,
      slug: entity.slug,
      options: entity.options as TOptions,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static variantFromEntity(entity: ProductVariant): TProductVariant {
    return {
      id: entity.id,
      productId: entity.productId,
      nameRo: entity.nameRo,
      nameRu: entity.nameRu,
      state: entity.state,
      sku: entity.sku,
      slug: entity.slug,
      fullSlug: entity.fullSlug,
      optionValues: entity.optionValues as TOptionValues,
      price: entity.price,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  static withVariants(product: Product, variants: ProductVariant[]): TProductWithVariants {
    return {
      ...ProductService.fromEntity(product),
      variants: variants.map(ProductService.variantFromEntity),
    };
  }

  static async list(): Promise<TProduct[]> {
    const entities = await prisma.product.findMany({ orderBy: { nameRo: 'asc' } });
    return entities.map(ProductService.fromEntity);
  }

  static async listActive(): Promise<TProduct[]> {
    const entities = await prisma.product.findMany({
      where: { state: ProductState.active },
      orderBy: { nameRo: 'asc' },
    });
    return entities.map(ProductService.fromEntity);
  }

  static async findById(id: number): Promise<TProductWithVariants | null> {
    const entity = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    return entity ? ProductService.withVariants(entity, entity.variants) : null;
  }

  static async findBySlug(slug: string): Promise<TProductWithVariants | null> {
    const entity = await prisma.product.findUnique({ where: { slug }, include: { variants: true } });
    return entity ? ProductService.withVariants(entity, entity.variants) : null;
  }

  static async search(input: TSearchProductsRequestDto) {
    const [items, meta] = await prisma.product
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true,
      });

    return PaginationResultDtoFactory.getWithCount(items.map(ProductService.fromEntity), meta);
  }

  static async create(input: TCreateProductInput): Promise<TProductWithVariants> {
    // Products are created with basic fields only; options and variants are added afterwards.
    const product = await prisma.product.create({
      data: {
        nameRo: input.nameRo,
        nameRu: input.nameRu,
        shortDescriptionRo: input.shortDescriptionRo ?? null,
        shortDescriptionRu: input.shortDescriptionRu ?? null,
        state: input.state,
        slug: input.slug,
        options: (input.options ?? {}) as Prisma.InputJsonValue,
      },
      include: { variants: true },
    });

    return ProductService.withVariants(product, product.variants);
  }

  static async addVariant(input: TAddVariantInput): Promise<TProductVariant> {
    const product = await prisma.product.findUnique({ where: { id: input.productId } });
    if (!product)
      throw new ORPCError('NOT_FOUND', { message: `Product '${input.productId}' not found` });

    const options = product.options as TOptions;
    validatePartialOptionValues(options, input.optionValues);

    const slug = generateVariantSlug(options, input.optionValues);
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
      },
    });

    return ProductService.variantFromEntity(variant);
  }

  static async updateVariant(input: TUpdateVariantInput): Promise<TProductVariant> {
    const existing = await prisma.productVariant.findUnique({
      where: { id: input.id },
      include: { product: true },
    });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    let slug = existing.slug;
    let fullSlug = existing.fullSlug;
    let optionValues = existing.optionValues as TOptionValues;

    if (input.optionValues !== undefined) {
      const options = existing.product.options as TOptions;
      validatePartialOptionValues(options, input.optionValues);
      optionValues = input.optionValues;
      slug = generateVariantSlug(options, optionValues);
      fullSlug = buildFullSlug(existing.product.slug, slug);

      if (slug !== existing.slug) {
        const clash = await prisma.productVariant.findFirst({
          where: { productId: existing.productId, slug, id: { not: existing.id } },
        });
        if (clash)
          throw new ORPCError('CONFLICT', { message: `A variant resolving to '${slug}' already exists` });
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id: input.id },
      data: {
        ...(input.nameRo !== undefined && { nameRo: input.nameRo }),
        ...(input.nameRu !== undefined && { nameRu: input.nameRu }),
        ...(input.state !== undefined && { state: input.state }),
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.optionValues !== undefined && { optionValues: optionValues as Prisma.InputJsonValue, slug, fullSlug }),
        ...(input.price !== undefined && { price: input.price }),
      },
    });

    return ProductService.variantFromEntity(variant);
  }

  static async deleteVariant(id: number): Promise<void> {
    const existing = await prisma.productVariant.findUnique({ where: { id }, select: { id: true } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    await prisma.productVariant.delete({ where: { id } });
  }

  static async update(id: number, input: TUpdateProductInput): Promise<TProductWithVariants> {
    const existing = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    const newSlug = input.slug ?? existing.slug;
    const newOptions = input.options ?? (existing.options as TOptions);
    const slugChanged = input.slug !== undefined && input.slug !== existing.slug;
    const optionsChanged =
      input.options !== undefined &&
      JSON.stringify(input.options) !== JSON.stringify(existing.options);

    // Resolve new optionValues/slugs for every existing variant before touching the DB.
    const reconciled = (slugChanged || optionsChanged)
      ? existing.variants.map(variant => reconcileVariant(variant, newOptions, newSlug))
      : [];

    if (optionsChanged)
      assertNoDuplicateSlugs(reconciled.map(v => v.slug));

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id },
        data: {
          ...(input.nameRo !== undefined && { nameRo: input.nameRo }),
          ...(input.nameRu !== undefined && { nameRu: input.nameRu }),
          ...(input.shortDescriptionRo !== undefined && { shortDescriptionRo: input.shortDescriptionRo }),
          ...(input.shortDescriptionRu !== undefined && { shortDescriptionRu: input.shortDescriptionRu }),
          ...(input.state !== undefined && { state: input.state }),
          ...(input.slug !== undefined && { slug: input.slug }),
          ...(input.options !== undefined && { options: input.options as Prisma.InputJsonValue }),
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
      return ProductService.withVariants(product, variants);
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
    const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
    if (!existing)
      throw new ORPCError('NOT_FOUND');

    await prisma.product.delete({ where: { id } });
  }
}


export function slugifyValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateVariantSlug(options: TOptions, optionValues: TOptionValues): string {
  // Deterministic: follow options key order, slugify each selected value. Values may be missing
  // (variants only need full coverage at creation), so skip absent ones.
  return Object.keys(options)
    .filter(key => optionValues[key] != null && optionValues[key] !== '')
    .map(key => slugifyValue(optionValues[key]))
    .join('-');
}

export function buildFullSlug(productSlug: string, variantSlug: string): string {
  return `${productSlug}-${variantSlug}`;
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
 * Brings an existing variant in line with a (possibly changed) `options` definition and product slug:
 * keeps each value that still references a known option and an allowed value, drops the rest (removed
 * options or values no longer allowed), and recomputes slug/fullSlug. Variants need not cover every
 * option, so nothing is required or back-filled here.
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

  const slug = generateVariantSlug(options, next);
  return { id: variant.id, optionValues: next, slug, fullSlug: buildFullSlug(productSlug, slug) };
}

function assertNoDuplicateSlugs(slugs: string[]): void {
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug))
      throw new ORPCError('CONFLICT', { message: `Multiple variants resolve to the same slug '${slug}'` });
    seen.add(slug);
  }
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
