import { createOrder } from './create.ts';
import { getOrder } from './get.ts';

export const ordersRoutes = {
  create: createOrder,
  get: getOrder,
};
