import { createFileRoute } from '@tanstack/react-router';
import { verifyMaibCallbackSignature } from '@/features/orders/common/services/maib-client.ts';
import { OnlinePaymentService } from '@/features/orders/common/services/online-payment-service.ts';
import { logger } from '@/lib/logger.ts';

interface IMaibCallbackPayload {
  checkoutId: string;
  paymentId: string;
  paymentStatus: string;
  paymentMethod: string | null;
  retrievalReferenceNumber: string;
  paymentExecutedAt: string;
}

async function handle({ request }: { request: Request }): Promise<Response> {
  const signature = request.headers.get('x-signature');
  const timestamp = request.headers.get('x-signature-timestamp');
  const rawBody = await request.text();

  if (!signature || !timestamp || !(await verifyMaibCallbackSignature(rawBody, timestamp, signature))) {
    logger.warn('Rejected maib callback: invalid signature');
    return new Response('Invalid signature', { status: 401 });
  }

  const payload = JSON.parse(rawBody) as IMaibCallbackPayload;

  const updated = await OnlinePaymentService.applyCallback(payload.checkoutId, {
    paymentStatus: payload.paymentStatus,
    paymentId: payload.paymentId,
    paymentMethod: payload.paymentMethod,
    referenceNumber: payload.retrievalReferenceNumber,
    paymentExecutedAt: payload.paymentExecutedAt,
  });

  if (!updated) {
    logger.warn({ checkoutId: payload.checkoutId }, 'Received maib callback for unknown checkout');
    return new Response('Unknown checkout', { status: 404 });
  }

  return new Response('OK', { status: 200 });
}

export const Route = createFileRoute('/api/orders/online-payment-callback')({
  server: {
    handlers: {
      POST: handle,
    },
  },
});
