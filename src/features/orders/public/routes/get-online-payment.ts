import { z } from 'zod';
import { ordersBase, ordersPath } from './base.ts';
import { onlinePaymentDtoSchema } from '@/features/orders/common/dtos/online-payment.ts';
import { OnlinePaymentService } from '@/features/orders/common/services/online-payment-service.ts';
import { OrderService } from '@/features/orders/common/services/order-service.ts';

export const getOnlinePayment = ordersBase
  .route({
    method: 'GET',
    path: `${ordersPath}/{uid}/online-payment`,
    summary: 'Get the online payment for an order',
    description: 'Returns the order\'s payment attempt, syncing with maib first if it is still in-flight',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ uid: z.string() }))
  .output(onlinePaymentDtoSchema.nullable())
  .handler(async ({ input: { uid }, errors }) => {
    const order = await OrderService.findByUid(uid);
    if (!order)
      throw errors.NOT_FOUND();

    return OnlinePaymentService.findByOrderIdFresh(order.id);
  });
