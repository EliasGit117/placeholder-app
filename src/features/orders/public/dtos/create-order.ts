import { z } from 'zod';
import { DeliveryMethod } from '~/prisma/generated/prisma/enums.ts';
import { PaymentType } from '@/features/orders/common/constants.ts';

export const createOrderDtoSchema = z.object({
  paymentType: z.enum(PaymentType),
  fullName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().min(1).email(),
  deliveryMethod: z.enum(DeliveryMethod),
  address: z.string().min(1),
});

export type TCreateOrderDto = z.infer<typeof createOrderDtoSchema>;
