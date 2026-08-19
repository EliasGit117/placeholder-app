import { z } from 'zod';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ordersAdminBase } from './base.ts';
import { updateOrderStatusDtoSchema } from '@/features/orders/admin/dtos/update-order-status.ts';
import { orderDtoSchema } from '@/features/orders/common/dtos/order.ts';
import { OrderService } from '../../common/services/order-service.ts';

const updateOrderStatusInputSchema = updateOrderStatusDtoSchema.extend({ id: z.number() });

export const adminOrdersUpdateStatus = ordersAdminBase
  .route({
    method: 'PATCH',
    summary: 'Update order status',
    description: 'Updates an order\'s status',
  })
  .errors({ FORBIDDEN: {}, NOT_FOUND: {} })
  .use(authMiddleware)
  .input(updateOrderStatusInputSchema)
  .output(orderDtoSchema)
  .handler(async ({ input: { id, status }, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { orders: ['update'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return OrderService.updateStatus(id, status);
  });
