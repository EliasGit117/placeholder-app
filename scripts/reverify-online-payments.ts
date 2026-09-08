/**
 * Fallback script: re-verifies OnlinePayment rows stuck in a non-terminal
 * status by pulling the true status from maib directly.
 *
 * MAIB confirms payment completion via a server-to-server webhook
 * (POST /api/orders/online-payment-callback). That webhook can't reach
 * localhost in dev, and can be delayed/dropped in prod. This script is a
 * safety net for those missed callbacks — not a replacement for the webhook.
 *
 * The app also runs this same logic automatically in-process (see
 * OnlinePaymentService.startReverifyJob in
 * src/features/orders/common/services/online-payment-service.ts,
 * gated by REVERIFY_PAYMENTS_ENABLED) — this script remains useful for
 * environments where the app process is short-lived, or an external cron
 * is preferred over the in-process timer.
 *
 * Run with: bun run reverify-payments
 *
 * Not scheduled by this repo — invoke it from an external cron, e.g. every 5
 * minutes: cd /path/to/app && bun run reverify-payments >> /var/log/reverify-payments.log 2>&1
 */
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger.ts';
import { OnlinePaymentService } from '@/features/orders/common/services/online-payment-service.ts';

async function main() {
  const result = await OnlinePaymentService.reverifyPending();
  logger.info({ ...result }, 'reverify-online-payments: run complete');
}

main()
  .catch((error) => {
    logger.error({ err: error }, 'reverify-online-payments: fatal error');
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
