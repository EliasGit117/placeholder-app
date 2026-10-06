import { z } from 'zod';
import type { OnlinePayment } from '~/prisma/generated/prisma/client.ts';
import { OnlinePaymentProvider, OnlinePaymentRefundStatus, OnlinePaymentStatus } from '~/prisma/generated/prisma/enums.ts';

export const onlinePaymentDtoSchema = z.object({
  id: z.number(),
  orderId: z.number(),
  provider: z.enum(OnlinePaymentProvider),
  status: z.enum(OnlinePaymentStatus),
  checkoutId: z.string().nullable(),
  checkoutUrl: z.string().nullable(),
  paymentId: z.string().nullable(),
  expiresAt: z.string().nullable(),
  amount: z.number().int(),
  currency: z.string(),
  paymentMethod: z.string().nullable(),
  referenceNumber: z.string().nullable(),
  executedAt: z.string().nullable(),
  refundId: z.string().nullable(),
  refundStatus: z.enum(OnlinePaymentRefundStatus).nullable(),
  refundAmount: z.number().int().nullable(),
  refundReason: z.string().nullable(),
  refundedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TOnlinePaymentDto = z.infer<typeof onlinePaymentDtoSchema>;

// Guest-facing subset: no provider ids, RRN or the admin-written refund reason.
export const publicOnlinePaymentDtoSchema = onlinePaymentDtoSchema.pick({
  id: true,
  orderId: true,
  provider: true,
  status: true,
  checkoutUrl: true,
  expiresAt: true,
  amount: true,
  currency: true,
  paymentMethod: true,
  executedAt: true,
  refundStatus: true,
  refundAmount: true,
  refundedAt: true,
});

export type TPublicOnlinePaymentDto = z.infer<typeof publicOnlinePaymentDtoSchema>;

export class OnlinePaymentDtoFactory {

  static fromEntity(entity: OnlinePayment): TOnlinePaymentDto {
    return {
      id: entity.id,
      orderId: entity.orderId,
      provider: entity.provider,
      status: entity.status,
      checkoutId: entity.checkoutId,
      checkoutUrl: entity.checkoutUrl,
      paymentId: entity.paymentId,
      expiresAt: entity.expiresAt?.toISOString() ?? null,
      amount: entity.amount,
      currency: entity.currency,
      paymentMethod: entity.paymentMethod,
      referenceNumber: entity.referenceNumber,
      executedAt: entity.executedAt?.toISOString() ?? null,
      refundId: entity.refundId,
      refundStatus: entity.refundStatus,
      refundAmount: entity.refundAmount,
      refundReason: entity.refundReason,
      refundedAt: entity.refundedAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
