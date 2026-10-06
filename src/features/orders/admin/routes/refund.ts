import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ordersAdminBase, ordersAdminPath } from './base.ts';
import { refundOrderDtoSchema } from '@/features/orders/admin/dtos/refund-order.ts';
import { onlinePaymentDtoSchema } from '@/features/orders/common/dtos/online-payment.ts';
import { OnlinePaymentService } from '../../common/services/online-payment-service.ts';

const refundOrderInputSchema = refundOrderDtoSchema.extend({ id: z.number() });

export const adminOrdersRefund = ordersAdminBase
  .route({
    method: 'POST',
    path: `${ordersAdminPath}/{id}/refund`,
    summary: 'Refund order online payment',
    description: 'Fully refunds a completed maib online payment of the order',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {}, BAD_REQUEST: {}, BAD_GATEWAY: {} })
  .use(authMiddleware)
  .input(refundOrderInputSchema)
  .output(onlinePaymentDtoSchema)
  .handler(async ({ input: { id, reason }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { orders: ['refund'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return OnlinePaymentService.refund(id, reason);
  });
