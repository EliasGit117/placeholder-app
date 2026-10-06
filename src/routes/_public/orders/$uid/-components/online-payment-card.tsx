import type { FC } from 'react';
import { IconClock, IconCreditCard, IconCreditCardRefund, IconExternalLink } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { OnlinePaymentStatusIcon } from '@/components/icons/online-payment-status-icon.tsx';
import type { TPublicOnlinePaymentDto } from '@/features/orders/common/dtos/online-payment.ts';
import { OnlinePaymentRefundStatus } from '~/prisma/generated/prisma/enums.ts';
import { onlinePaymentStatusLabel, onlinePaymentStatusDescription, IN_FLIGHT_STATUSES } from '../-consts/online-payment-status.ts';

interface IOnlinePaymentCardProps {
  onlinePayment: TPublicOnlinePaymentDto;
  confirmingRedirect: boolean;
}

export const OnlinePaymentCard: FC<IOnlinePaymentCardProps> = ({ onlinePayment, confirmingRedirect }) => {
  // Badge still shows the real polled status; just swap the copy while it catches up.
  const showConfirming = confirmingRedirect && IN_FLIGHT_STATUSES.includes(onlinePayment.status);
  const canContinue = IN_FLIGHT_STATUSES.includes(onlinePayment.status) && onlinePayment.checkoutUrl && !showConfirming;

  // REJECTED means the money stays with the merchant, so the payer still sees "paid".
  const refundDone = onlinePayment.refundStatus === OnlinePaymentRefundStatus.ACCEPTED;
  const refundPending = onlinePayment.refundStatus === OnlinePaymentRefundStatus.CREATED
    || onlinePayment.refundStatus === OnlinePaymentRefundStatus.REQUESTED
    || onlinePayment.refundStatus === OnlinePaymentRefundStatus.MANUAL;
  const refundParams = { amount: onlinePayment.refundAmount ?? onlinePayment.amount, currency: onlinePayment.currency };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <IconCreditCard className="size-4 text-muted-foreground"/>
            <CardTitle>{m['pages.order_confirmation.online_payment_title']()}</CardTitle>
          </div>
          <CardDescription>
            {refundDone
              ? m['pages.order_confirmation.refund_done_description'](refundParams)
              : refundPending
                ? m['pages.order_confirmation.refund_processing_description'](refundParams)
                : showConfirming
                  ? m['pages.order_confirmation.online_payment_status.confirming']()
                  : onlinePaymentStatusDescription[onlinePayment.status]()}
          </CardDescription>
        </div>
        <Badge variant="secondary">
          {refundDone ? (
            <>
              <IconCreditCardRefund className="size-3.5"/>
              {m['pages.order_confirmation.refund_done_badge']()}
            </>
          ) : refundPending ? (
            <>
              <IconClock className="size-3.5"/>
              {m['pages.order_confirmation.refund_processing_badge']()}
            </>
          ) : (
            <>
              <OnlinePaymentStatusIcon status={onlinePayment.status} className="size-3.5"/>
              {onlinePaymentStatusLabel[onlinePayment.status]()}
            </>
          )}
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
