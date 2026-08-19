import { authMiddleware } from '@/lib/auth/middleware.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ordersAdminBase, ordersAdminPath } from './base.ts';
import {
  searchOrdersRequestDtoSchema,
  searchOrdersResultDtoSchema,
} from '@/features/orders/admin/dtos/search-orders.ts';
import { OrderService } from '../../common/services/order-service.ts';

export const adminOrdersSearch = ordersAdminBase
  .route({
    method: 'POST',
    path: `${ordersAdminPath}/search`,
    summary: 'Search orders',
    description: 'Returns paginated list of orders',
  })
  .errors({ FORBIDDEN: {} })
  .use(authMiddleware)
  .input(searchOrdersRequestDtoSchema)
  .output(searchOrdersResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { orders: ['list'] } },
    });

    if (!success)
      throw errors.FORBIDDEN();

    return OrderService.search(input);
  });
