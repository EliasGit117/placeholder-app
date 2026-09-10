import { ORPCError } from '@orpc/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger.ts';
import { serverEnvConfig } from '@/lib/config/server-env-config.ts';
import { OnlinePaymentStatus } from '~/prisma/generated/prisma/enums.ts';
import type { OnlinePayment } from '~/prisma/generated/prisma/client.ts';
import { MaibClient, type TMaibCheckoutStatus } from '@/features/orders/common/services/maib-client.ts';
import { OnlinePaymentDtoFactory, type TOnlinePaymentDto } from '@/features/orders/common/dtos/online-payment.ts';

const REVERIFY_BATCH_SIZE = 50;
const REVERIFY_GRACE_PERIOD_MS = 3 * 60 * 1000;
const REVERIFY_MAX_ATTEMPTS = 5;

export interface IReverifyPassResult {
  scanned: number;
  updatedTerminal: number;
  stillPending: number;
  errors: number;
}

const MAIB_STATUS_TO_ENUM: Record<TMaibCheckoutStatus, OnlinePaymentStatus> = {
  WaitingForInit: OnlinePaymentStatus.WAITING_FOR_INIT,
  Initialized: OnlinePaymentStatus.INITIALIZED,
  PaymentMethodSelected: OnlinePaymentStatus.PAYMENT_METHOD_SELECTED,
  Completed: OnlinePaymentStatus.COMPLETED,
  Expired: OnlinePaymentStatus.EXPIRED,
  Abandoned: OnlinePaymentStatus.ABANDONED,
  Cancelled: OnlinePaymentStatus.CANCELLED,
  Failed: OnlinePaymentStatus.FAILED,
};

export const NON_TERMINAL_STATUSES: OnlinePaymentStatus[] = [
  OnlinePaymentStatus.WAITING_FOR_INIT,
  OnlinePaymentStatus.INITIALIZED,
  OnlinePaymentStatus.PAYMENT_METHOD_SELECTED,
];

declare global {
  var __reverifyPaymentsInterval: ReturnType<typeof setInterval> | undefined;
}

export class OnlinePaymentService {

  static async findByOrderId(orderId: number): Promise<TOnlinePaymentDto | null> {
    const entity = await prisma.onlinePayment.findUnique({ where: { orderId } });
    return entity ? OnlinePaymentDtoFactory.fromEntity(entity) : null;
  }

  // Payer can land back on the order page before maib's callback arrives (or if it
  // never arrives), so pull the current state directly when it's still in-flight.
  static async findByOrderIdFresh(orderId: number): Promise<TOnlinePaymentDto | null> {
    const entity = await prisma.onlinePayment.findUnique({ where: { orderId } });
    if (!entity)
      return null;

    if (!NON_TERMINAL_STATUSES.includes(entity.status) || !entity.checkoutId)
      return OnlinePaymentDtoFactory.fromEntity(entity);

    const synced = await OnlinePaymentService.syncFromMaib(entity.checkoutId).catch(() => null);
    return OnlinePaymentDtoFactory.fromEntity(synced ?? entity);
  }

  // Registers a hosted checkout session with maib for an order and persists the
  // pending row. One order gets at most one active attempt at a time — retrying a
  // failed/expired payment replaces the previous row rather than accumulating rows,
  // since only the latest attempt matters for fulfilling the order.
  static async createForOrder(orderId: number): Promise<TOnlinePaymentDto> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order)
      throw new ORPCError('NOT_FOUND', { message: `Order '${orderId}' not found` });

    const callbackUrl = `${serverEnvConfig.appUrl}/api/orders/online-payment-callback`;

    const checkout = await MaibClient.createCheckout({
      amount: order.totalPrice,
      currency: 'MDL',
      orderInfo: { id: order.uid, description: `Order ${order.uid}` },
      payerInfo: { name: order.fullName, email: order.email, phone: order.phone },
      callbackUrl,
      successUrl: `${serverEnvConfig.appUrl}/orders/${order.uid}`,
      failUrl: `${serverEnvConfig.appUrl}/orders/${order.uid}`,
    });

    const entity = await prisma.onlinePayment.upsert({
      where: { orderId },
      create: {
        orderId,
        status: OnlinePaymentStatus.WAITING_FOR_INIT,
        checkoutId: checkout.checkoutId,
        checkoutUrl: checkout.checkoutUrl,
        callbackUrl,
        amount: order.totalPrice,
        currency: 'MDL',
      },
      update: {
        status: OnlinePaymentStatus.WAITING_FOR_INIT,
        checkoutId: checkout.checkoutId,
        checkoutUrl: checkout.checkoutUrl,
        callbackUrl,
        paymentId: null,
        paymentMethod: null,
        referenceNumber: null,
        executedAt: null,
      },
    });

    return OnlinePaymentDtoFactory.fromEntity(entity);
  }

  // Pulls current state from maib for a checkout — used as a fallback when the
  // callback hasn't arrived yet (e.g. payer returns to successUrl before the
  // webhook lands).
  static async syncFromMaib(checkoutId: string): Promise<OnlinePayment | null> {
    const existing = await prisma.onlinePayment.findUnique({ where: { checkoutId } });
    if (!existing)
      return null;

    const details = await MaibClient.getCheckoutDetails(checkoutId);
    return OnlinePaymentService.applyCheckoutDetails(existing.orderId, {
      status: details.status,
      paymentId: details.payment?.paymentId ?? null,
      paymentMethod: details.payment?.paymentMethod ?? null,
      referenceNumber: details.payment?.referenceNumber ?? null,
      executedAt: details.payment?.executedAt ?? null,
      expiresAt: details.expiresAt,
    });
  }

  static async applyCallback(checkoutId: string, data: {
    paymentStatus: string;
    paymentId: string;
    paymentMethod: string | null;
    referenceNumber: string;
    paymentExecutedAt: string;
  }): Promise<OnlinePayment | null> {
    const existing = await prisma.onlinePayment.findUnique({ where: { checkoutId } });
    if (!existing)
      return null;

    return OnlinePaymentService.applyCheckoutDetails(existing.orderId, {
      status: data.paymentStatus === 'Executed' ? 'Completed' : 'Failed',
      paymentId: data.paymentId,
      paymentMethod: data.paymentMethod,
      referenceNumber: data.referenceNumber,
      executedAt: data.paymentExecutedAt,
      expiresAt: null,
    });
  }

  // Fallback for missed maib webhook callbacks: re-verifies OnlinePayment rows
  // stuck in a non-terminal status by pulling the true status from maib
  // directly. Shared by the interval job (below) and the standalone
  // `bun run reverify-payments` script for external-cron use.
  static async reverifyPending(): Promise<IReverifyPassResult> {
    const cutoff = new Date(Date.now() - REVERIFY_GRACE_PERIOD_MS);

    let scanned = 0;
    let updatedTerminal = 0;
    let stillPending = 0;
    let errors = 0;

    while (true) {
      const rows = await prisma.onlinePayment.findMany({
        where: {
          status: { in: NON_TERMINAL_STATUSES },
          checkoutId: { not: null },
          createdAt: { lt: cutoff },
          attemptCount: { lt: REVERIFY_MAX_ATTEMPTS },
        },
        orderBy: [{ attemptCount: 'asc' }, { id: 'asc' }],
        take: REVERIFY_BATCH_SIZE,
      });

      if (rows.length === 0)
        break;

      for (const row of rows) {
        scanned++;

        try {
          const updated = await OnlinePaymentService.syncFromMaib(row.checkoutId!);
          if (!updated) {
            logger.warn({ checkoutId: row.checkoutId, orderId: row.orderId }, 'reverify-online-payments: row disappeared during sync');
            continue;
          }
          if (NON_TERMINAL_STATUSES.includes(updated.status))
            stillPending++;
          else
            updatedTerminal++;
        } catch (err) {
          errors++;
          const attempt = row.attemptCount + 1;
          const exhausted = attempt >= REVERIFY_MAX_ATTEMPTS;

          await prisma.onlinePayment.update({
            where: { id: row.id },
            data: {
              attemptCount: { increment: 1 },
              ...(exhausted ? { status: OnlinePaymentStatus.FAILED } : {}),
            },
          });

          if (exhausted) {
            updatedTerminal++;
            logger.warn(
              { checkoutId: row.checkoutId, orderId: row.orderId, attempt },
              'reverify-online-payments: gave up after max attempts, marked FAILED'
            );
          } else {
            logger.warn({ checkoutId: row.checkoutId, orderId: row.orderId, attempt, err }, 'reverify-online-payments: sync failed');
          }
        }
      }
    }

    return { scanned, updatedTerminal, stillPending, errors };
  }

  // Starts an in-process interval that runs `reverifyPending()` periodically,
  // gated by REVERIFY_PAYMENTS_ENABLED. Guarded by a globalThis handle (mirrors
  // the prisma singleton pattern in src/lib/db/prisma.ts) so Vite's dev-mode
  // SSR module re-execution on HMR doesn't spawn duplicate intervals.
  static startReverifyJob(): void {
    if (!serverEnvConfig.reverifyPaymentsEnabled) {
      logger.info(
        { env: 'REVERIFY_PAYMENTS_ENABLED' },
        'reverify-payments-job: disabled — set REVERIFY_PAYMENTS_ENABLED=true to enable in-process auto-reverify'
      );
      return;
    }

    if (globalThis.__reverifyPaymentsInterval) {
      logger.info('reverify-payments-job: already running in this process, skipping duplicate start');
      return;
    }

    const intervalMinutes = serverEnvConfig.reverifyPaymentsIntervalMinutes;
    const intervalMs = intervalMinutes * 60 * 1000;
    logger.info({ intervalMinutes }, 'reverify-payments-job: starting in-process interval');

    let inFlight = false;
    const tick = async () => {
      if (inFlight) {
        logger.warn('reverify-payments-job: previous pass still running, skipping this tick');
        return;
      }
      inFlight = true;
      logger.info('reverify-payments-job: tick starting');
      try {
        const result = await OnlinePaymentService.reverifyPending();
        logger.info({ ...result }, 'reverify-payments-job: tick complete');
      } catch (err) {
        logger.error({ err }, 'reverify-payments-job: tick failed');
      } finally {
        inFlight = false;
      }
    };

    // Run one pass immediately so a fresh deploy/restart catches up on stuck
    // rows without waiting a full interval.
    void tick();

    const handle = setInterval(tick, intervalMs);
    handle.unref();
    globalThis.__reverifyPaymentsInterval = handle;
  }

  private static async applyCheckoutDetails(orderId: number, data: {
    status: TMaibCheckoutStatus;
    paymentId: string | null;
    paymentMethod: string | null;
    referenceNumber: string | null;
    executedAt: string | null;
    expiresAt: string | null;
  }): Promise<OnlinePayment> {
    return prisma.onlinePayment.update({
      where: { orderId },
      data: {
        status: MAIB_STATUS_TO_ENUM[data.status],
        paymentId: data.paymentId,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber,
        executedAt: data.executedAt ? new Date(data.executedAt) : null,
        ...(data.expiresAt ? { expiresAt: new Date(data.expiresAt) } : {}),
      },
    });
  }
}
