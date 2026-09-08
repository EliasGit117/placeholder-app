import { OrderStatus } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';

export const statusLabel: Record<OrderStatus, () => string> = {
  [OrderStatus.PENDING]: () => m['enums.order_status.pending'](),
  [OrderStatus.PROCESSING]: () => m['enums.order_status.processing'](),
  [OrderStatus.SHIPPED]: () => m['enums.order_status.shipped'](),
  [OrderStatus.COMPLETED]: () => m['enums.order_status.completed'](),
  [OrderStatus.CANCELLED]: () => m['enums.order_status.cancelled']()
};

export const statusContent: Record<OrderStatus, { title: () => string; description: () => string }> = {
  [OrderStatus.PENDING]: {
    title: () => m['pages.order_confirmation.status.pending.title'](),
    description: () => m['pages.order_confirmation.status.pending.description']()
  },
  [OrderStatus.PROCESSING]: {
    title: () => m['pages.order_confirmation.status.processing.title'](),
    description: () => m['pages.order_confirmation.status.processing.description']()
  },
  [OrderStatus.SHIPPED]: {
    title: () => m['pages.order_confirmation.status.shipped.title'](),
    description: () => m['pages.order_confirmation.status.shipped.description']()
  },
  [OrderStatus.COMPLETED]: {
    title: () => m['pages.order_confirmation.status.completed.title'](),
    description: () => m['pages.order_confirmation.status.completed.description']()
  },
  [OrderStatus.CANCELLED]: {
    title: () => m['pages.order_confirmation.status.cancelled.title'](),
    description: () => m['pages.order_confirmation.status.cancelled.description']()
  }
};
