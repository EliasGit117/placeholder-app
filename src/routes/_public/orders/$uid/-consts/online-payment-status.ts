import { OnlinePaymentStatus } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';

export const onlinePaymentStatusLabel: Record<OnlinePaymentStatus, () => string> = {
  [OnlinePaymentStatus.WAITING_FOR_INIT]: () => m['enums.online_payment_status.waiting_for_init'](),
  [OnlinePaymentStatus.INITIALIZED]: () => m['enums.online_payment_status.initialized'](),
  [OnlinePaymentStatus.PAYMENT_METHOD_SELECTED]: () => m['enums.online_payment_status.payment_method_selected'](),
  [OnlinePaymentStatus.COMPLETED]: () => m['enums.online_payment_status.completed'](),
  [OnlinePaymentStatus.EXPIRED]: () => m['enums.online_payment_status.expired'](),
  [OnlinePaymentStatus.ABANDONED]: () => m['enums.online_payment_status.abandoned'](),
  [OnlinePaymentStatus.CANCELLED]: () => m['enums.online_payment_status.cancelled'](),
  [OnlinePaymentStatus.FAILED]: () => m['enums.online_payment_status.failed']()
};

export const onlinePaymentStatusDescription: Record<OnlinePaymentStatus, () => string> = {
  [OnlinePaymentStatus.WAITING_FOR_INIT]: () => m['pages.order_confirmation.online_payment_status.waiting_for_init'](),
  [OnlinePaymentStatus.INITIALIZED]: () => m['pages.order_confirmation.online_payment_status.initialized'](),
  [OnlinePaymentStatus.PAYMENT_METHOD_SELECTED]: () => m['pages.order_confirmation.online_payment_status.payment_method_selected'](),
  [OnlinePaymentStatus.COMPLETED]: () => m['pages.order_confirmation.online_payment_status.completed'](),
  [OnlinePaymentStatus.EXPIRED]: () => m['pages.order_confirmation.online_payment_status.expired'](),
  [OnlinePaymentStatus.ABANDONED]: () => m['pages.order_confirmation.online_payment_status.abandoned'](),
  [OnlinePaymentStatus.CANCELLED]: () => m['pages.order_confirmation.online_payment_status.cancelled'](),
  [OnlinePaymentStatus.FAILED]: () => m['pages.order_confirmation.online_payment_status.failed'](),
};

export const IN_FLIGHT_STATUSES: OnlinePaymentStatus[] = [
  OnlinePaymentStatus.WAITING_FOR_INIT,
  OnlinePaymentStatus.INITIALIZED,
  OnlinePaymentStatus.PAYMENT_METHOD_SELECTED
];
