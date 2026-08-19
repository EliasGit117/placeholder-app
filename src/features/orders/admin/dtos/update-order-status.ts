import { z } from 'zod';
import { OrderStatus } from '~/prisma/generated/prisma/enums.ts';

export const updateOrderStatusDtoSchema = z.object({
  status: z.enum(OrderStatus),
});

export type TUpdateOrderStatusDto = z.infer<typeof updateOrderStatusDtoSchema>;
