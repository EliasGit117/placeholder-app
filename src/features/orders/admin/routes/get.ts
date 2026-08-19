import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ordersAdminBase, ordersAdminPath } from './base.ts';
import { orderDtoSchema } from '@/features/orders/common/dtos/order.ts';
import { OrderService } from '../../common/services/order-service.ts';

export const adminOrdersGet = ordersAdminBase
  .route({
    method: 'GET',
    path: `${ordersAdminPath}/{id}`,
    summary: 'Get order by id',
    description: 'Returns a single order with its line items',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(z.object({ id: z.coerce.number() }))
  .output(orderDtoSchema)
  .handler(async ({ input: { id }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { orders: ['get'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    const result = await OrderService.findById(id);
    if (result == null)
      throw errors.NOT_FOUND();

    return result;
  });
