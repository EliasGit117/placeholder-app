import { ordersBase } from './base.ts';
import { createOrderDtoSchema } from '@/features/orders/public/dtos/create-order.ts';
import { orderDtoSchema } from '@/features/orders/common/dtos/order.ts';
import { OrderService } from '@/features/orders/common/services/order-service.ts';
import { readCart, writeCart } from '@/features/checkout/common/lib/cart-cookie.ts';

export const createOrder = ordersBase
  .route({
    method: 'POST',
    summary: 'Place an order',
    description: 'Creates an order from the current cart cookie and empties the cart',
  })
  .meta({ anonymous: true })
  .errors({ BAD_REQUEST: {}, NOT_FOUND: {} })
  .input(createOrderDtoSchema)
  .output(orderDtoSchema)
  .handler(async ({ input, context: { headers, resHeaders }, errors }) => {
    const cart = readCart(headers);
    if (cart.length === 0)
      throw errors.BAD_REQUEST({ message: 'Cart is empty' });

    const order = await OrderService.create({
      items: cart.map((item) => ({ variantId: item.id, count: item.count })),
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      deliveryMethod: input.deliveryMethod,
      address: input.address,
    });

    writeCart(resHeaders, []);

    return order;
  });
