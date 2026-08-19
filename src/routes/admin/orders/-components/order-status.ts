import { IconCircleCheck, IconCircleX, IconClock, IconLoader2, IconTruckDelivery, type TablerIcon } from '@tabler/icons-react';
import { OrderStatus } from '~/prisma/generated/prisma/enums.ts';
import { m } from '@/paraglide/messages';

export interface IOrderStatusOption {
  value: OrderStatus;
  label: () => string;
  icon: TablerIcon;
}

export const orderStatusOptions: IOrderStatusOption[] = [
  { value: OrderStatus.PENDING, label: () => m['enums.order_status.pending'](), icon: IconClock },
  { value: OrderStatus.PROCESSING, label: () => m['enums.order_status.processing'](), icon: IconLoader2 },
  { value: OrderStatus.SHIPPED, label: () => m['enums.order_status.shipped'](), icon: IconTruckDelivery },
  { value: OrderStatus.COMPLETED, label: () => m['enums.order_status.completed'](), icon: IconCircleCheck },
  { value: OrderStatus.CANCELLED, label: () => m['enums.order_status.cancelled'](), icon: IconCircleX },
];

export function getOrderStatusOption(status: OrderStatus): IOrderStatusOption {
  return orderStatusOptions.find((o) => o.value === status) ?? orderStatusOptions[0];
}
