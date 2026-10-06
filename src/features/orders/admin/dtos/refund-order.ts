import { z } from 'zod';

export const refundOrderDtoSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

export type TRefundOrderDto = z.infer<typeof refundOrderDtoSchema>;
