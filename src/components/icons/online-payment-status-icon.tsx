import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { OnlinePaymentStatus } from '~/prisma/generated/prisma/enums.ts';
import { IconAlertCircle, IconBan, IconCircleCheck, IconCircleX, IconClock, IconClockX, IconCreditCard, IconLoader2 } from '@tabler/icons-react';

interface IOnlinePaymentStatusIconProps {
  status: OnlinePaymentStatus | string | undefined | null;
  className?: string;
}

export const OnlinePaymentStatusIcon: FC<IOnlinePaymentStatusIconProps> = (props) => {
  const className = cn(props.className);
  const Icon = getOnlinePaymentStatusIcon(props.status);

  return <Icon className={className}/>;
};

export function getOnlinePaymentStatusIcon(status: OnlinePaymentStatus | string | undefined | null) {
  switch (status) {
    case OnlinePaymentStatus.WAITING_FOR_INIT:
      return IconClock;

    case OnlinePaymentStatus.INITIALIZED:
      return IconLoader2;

    case OnlinePaymentStatus.PAYMENT_METHOD_SELECTED:
      return IconCreditCard;

    case OnlinePaymentStatus.COMPLETED:
      return IconCircleCheck;

    case OnlinePaymentStatus.EXPIRED:
      return IconClockX;

    case OnlinePaymentStatus.ABANDONED:
      return IconBan;

    case OnlinePaymentStatus.CANCELLED:
      return IconCircleX;

    case OnlinePaymentStatus.FAILED:
      return IconAlertCircle;

    default:
      return IconClock;
  }
}
