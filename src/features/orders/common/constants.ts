export const smallDeliveryOrderThreshold = 500;
export const smallDeliveryOrderSurcharge = 100;

// Not backed by a DB enum: cash orders never create an OnlinePayment row,
// so this only distinguishes the checkout flow, not persisted order state.
export const PaymentType = {
  CASH: 'cash',
  MAIB: 'maib',
} as const;

export type TPaymentType = (typeof PaymentType)[keyof typeof PaymentType];
