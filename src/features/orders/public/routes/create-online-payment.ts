import { z } from 'zod';
import { ordersBase, ordersPath } from './base.ts';
import { onlinePaymentDtoSchema } from '@/features/orders/common/dtos/online-payment.ts';
import { OnlinePaymentService } from '@/features/orders/common/services/online-payment-service.ts';
import { OrderService } from '@/features/orders/common/services/order-service.ts';

export const createOnlinePayment = ordersBase
  .route({
    method: 'POST',
    path: `${ordersPath}/{uid}/online-payment`,
    summary: 'Start an online payment for an order',
    description: 'Registers a maib hosted checkout session for the order and returns the URL to redirect the payer to',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ uid: z.string() }))
  .output(onlinePaymentDtoSchema)
  .handler(async ({ input: { uid }, errors }) => {
    const order = await OrderService.findByUid(uid);
    if (!order)
      throw errors.NOT_FOUND();

    return OnlinePaymentService.createForOrder(order.id);
  });
