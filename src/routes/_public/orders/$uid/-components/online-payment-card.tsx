import type { FC } from 'react';
import { IconCreditCard, IconExternalLink } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OnlinePaymentStatusIcon } from '@/components/icons/online-payment-status-icon.tsx';
import type { TOnlinePaymentDto } from '@/features/orders/common/dtos/online-payment.ts';
import { onlinePaymentStatusLabel, onlinePaymentStatusDescription, IN_FLIGHT_STATUSES } from '../-consts/online-payment-status.ts';

interface IOnlinePaymentCardProps {
  onlinePayment: TOnlinePaymentDto;
  confirmingRedirect: boolean;
}

export const OnlinePaymentCard: FC<IOnlinePaymentCardProps> = ({ onlinePayment, confirmingRedirect }) => {
  // Badge still shows the real polled status; just swap the copy while it catches up.
  const showConfirming = confirmingRedirect && IN_FLIGHT_STATUSES.includes(onlinePayment.status);
  const canContinue = IN_FLIGHT_STATUSES.includes(onlinePayment.status) && onlinePayment.checkoutUrl && !showConfirming;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconCreditCard className="size-4 text-muted-foreground"/>
            <CardTitle>{m['pages.order_confirmation.online_payment_title']()}</CardTitle>
          </div>
          <CardDescription>
            {showConfirming
              ? m['pages.order_confirmation.online_payment_status.confirming']()
              : onlinePaymentStatusDescription[onlinePayment.status]()}
          </CardDescription>
        </div>
        <Badge variant="secondary">
          <OnlinePaymentStatusIcon status={onlinePayment.status} className="size-3.5"/>
          {onlinePaymentStatusLabel[onlinePayment.status]()}
        </Badge>
      </CardHeader>

      {canContinue && (
        <CardContent className="flex flex-col gap-4">
          <div className="border-t border-dashed"/>

          <div className="flex justify-end">
            <Button asChild variant="outline">
              <a href={onlinePayment.checkoutUrl!}>
                {m['pages.order_confirmation.online_payment_continue']()}
                <IconExternalLink/>
              </a>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
