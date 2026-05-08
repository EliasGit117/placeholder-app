import { Prisma } from '~/prisma/generated/prisma/client.ts';

const SLOW_QUERY_THRESHOLD_MS = 500;

export const slowQueryLogger = Prisma.defineExtension({
  name: 'slowQueryLogger',
  query: {
    $allModels: {
      $allOperations: async ({ model, operation, args, query }) => {
        const start = Date.now();

        try {
          const result = await query(args);
          const duration = Date.now() - start;

          if (duration >= SLOW_QUERY_THRESHOLD_MS) {
            console.warn('[Prisma] Slow query detected', {
              model,
              operation,
              durationMs: duration,
            });
          }

          return result;
        } catch (error) {
          const duration = Date.now() - start;

          console.warn('[Prisma] Query failed', {
            model,
            operation,
            durationMs: duration,
          });
          throw error;
        }
      }
    }
  }
});