import { z } from 'zod';
import { ordersBase, ordersPath } from './base.ts';
import { orderDtoSchema } from '@/features/orders/common/dtos/order.ts';
import { OrderService } from '@/features/orders/common/services/order-service.ts';

export const getOrder = ordersBase
  .route({
    method: 'GET',
    path: `${ordersPath}/{uid}`,
    summary: 'Get order by uid',
    description: 'Returns a single order (guest access via its unguessable uid)',
  })
  .meta({ anonymous: true })
  .errors({ NOT_FOUND: {} })
  .input(z.object({ uid: z.string() }))
  .output(orderDtoSchema)
  .handler(async ({ input: { uid }, errors }) => {
    const result = await OrderService.findByUid(uid);
    if (result == null)
      throw errors.NOT_FOUND();

    return result;
  });
