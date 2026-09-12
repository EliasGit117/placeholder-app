/**
 * Benchmarks the two approaches tried for ProductService.findDetailsByVariantSlug:
 *
 *   - "old": the original shape — a variant lookup, then product+category+
 *     siblings and the target variant's images fetched in parallel.
 *   - "new": the current shape — everything fused into one TypedSQL query
 *     (prisma/sql/findProductDetailsByVariantSlug.sql).
 *
 * Picks a real, currently-sellable variant slug from the DB, runs both a
 * few times to warm up connections/caches, then times N runs of each and
 * prints min/median/avg/p95.
 *
 * Run with: bun run benchmark-product-query
 */
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger.ts';
import { ImageResourceType, ProductState } from '~/prisma/generated/prisma/client.ts';
import { ImageService } from '@/features/images/common/services/image-service.ts';
import { findProductDetailsByVariantSlug } from '~/prisma/generated/prisma/sql.ts';

const RUNS = 30;
const WARMUP_RUNS = 5;

async function oldApproach(fullSlug: string) {
  const sellableStates: ProductState[] = [ProductState.ACTIVE, ProductState.NOT_AVAILABLE];

  const targetVariant = await prisma.productVariant.findUnique({
    where: { fullSlug },
    select: { id: true, productId: true, state: true },
  });

  if (!targetVariant || !sellableStates.includes(targetVariant.state))
    return null;

  const [product, images] = await Promise.all([
    prisma.product.findUnique({
      where: { id: targetVariant.productId, state: ProductState.ACTIVE },
      include: {
        category: { select: { nameRo: true, nameRu: true } },
        variants: { where: { state: { in: sellableStates } }, orderBy: { id: 'asc' } },
      },
    }),
    ImageService.findByResources(ImageResourceType.PRODUCT_VARIANT, [String(targetVariant.id)]),
  ]);

  return { product, images };
}

async function newApproach(fullSlug: string) {
  const rows = await prisma.$queryRawTyped(findProductDetailsByVariantSlug(fullSlug));
  return rows[0] ?? null;
}

async function timeRuns(run: () => Promise<unknown>, runs: number): Promise<number[]> {
  const durations: number[] = [];
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    await run();
    durations.push(performance.now() - start);
  }
  return durations;
}

function stats(durations: number[]) {
  const sorted = [...durations].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  const p95Index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95));

  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    avg: sum / sorted.length,
    p95: sorted[p95Index],
    max: sorted[sorted.length - 1],
  };
}

function fmt(ms: number) {
  return `${ms.toFixed(1)}ms`;
}

async function main() {
  const targetVariant = await prisma.productVariant.findFirst({
    where: { state: { in: [ProductState.ACTIVE, ProductState.NOT_AVAILABLE] }, product: { state: ProductState.ACTIVE } },
    select: { fullSlug: true },
  });

  if (!targetVariant) {
    logger.error('benchmark-product-detail-query: no sellable product variant found to benchmark against');
    process.exitCode = 1;
    return;
  }

  const { fullSlug } = targetVariant;
  logger.info({ fullSlug, runs: RUNS, warmupRuns: WARMUP_RUNS }, 'benchmark-product-detail-query: starting');

  // Warm up connections/caches for both approaches before timing.
  await timeRuns(() => oldApproach(fullSlug), WARMUP_RUNS);
  await timeRuns(() => newApproach(fullSlug), WARMUP_RUNS);

  const oldDurations = await timeRuns(() => oldApproach(fullSlug), RUNS);
  const newDurations = await timeRuns(() => newApproach(fullSlug), RUNS);

  const oldStats = stats(oldDurations);
  const newStats = stats(newDurations);

  console.log(`\nfullSlug: ${fullSlug}  (${RUNS} timed runs each, ${WARMUP_RUNS} warmup runs discarded)\n`);
  console.log('approach   min       median    avg       p95       max');
  console.log(`old        ${fmt(oldStats.min).padEnd(10)}${fmt(oldStats.median).padEnd(10)}${fmt(oldStats.avg).padEnd(10)}${fmt(oldStats.p95).padEnd(10)}${fmt(oldStats.max)}`);
  console.log(`new        ${fmt(newStats.min).padEnd(10)}${fmt(newStats.median).padEnd(10)}${fmt(newStats.avg).padEnd(10)}${fmt(newStats.p95).padEnd(10)}${fmt(newStats.max)}`);

  const diff = oldStats.median - newStats.median;
  const pct = (diff / oldStats.median) * 100;
  console.log(`\nnew vs old (median): ${diff >= 0 ? '-' : '+'}${fmt(Math.abs(diff))} (${pct >= 0 ? '-' : '+'}${Math.abs(pct).toFixed(1)}%)`);
}

main()
  .catch((error) => {
    logger.error({ err: error }, 'benchmark-product-detail-query: fatal error');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
