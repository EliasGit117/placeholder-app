import { type FC } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconCreditCardRefund, IconCreditCard } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { m } from '@/paraglide/messages';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { OnlinePaymentStatusIcon } from '@/components/icons/online-payment-status-icon.tsx';
import type { TOnlinePaymentDto } from '@/features/orders/common/dtos/online-payment.ts';
import { onlinePaymentStatusLabel } from '@/routes/_public/orders/$uid/-consts/online-payment-status.ts';
import { OnlinePaymentRefundStatus, OnlinePaymentStatus } from '~/prisma/generated/prisma/enums.ts';

const refundStatusLabel: Record<OnlinePaymentRefundStatus, () => string> = {
  [OnlinePaymentRefundStatus.CREATED]: () => m['enums.online_payment_refund_status.created'](),
  [OnlinePaymentRefundStatus.REQUESTED]: () => m['enums.online_payment_refund_status.requested'](),
  [OnlinePaymentRefundStatus.ACCEPTED]: () => m['enums.online_payment_refund_status.accepted'](),
  [OnlinePaymentRefundStatus.REJECTED]: () => m['enums.online_payment_refund_status.rejected'](),
  [OnlinePaymentRefundStatus.MANUAL]: () => m['enums.online_payment_refund_status.manual'](),
};

interface IOnlinePaymentCardProps {
  orderId: number;
  onlinePayment: TOnlinePaymentDto;
  canRefund: boolean;
  locale: string;
}

export const OnlinePaymentCard: FC<IOnlinePaymentCardProps> = ({ orderId, onlinePayment, canRefund, locale }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { mutate: refund, isPending } = useMutation({
    mutationFn: (reason: string) => orpc.admin.orders.refund.call({ id: orderId, reason }),
    // Awaited so the mutation stays pending (button disabled) until the refetched order
    // carries the refund state; otherwise the button flashes back for a moment.
    onSuccess: async () => {
      toast.success(m['pages.orders.detail.refund_success']());
      await queryClient.invalidateQueries({ queryKey: orpc.admin.orders.get.key() });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    },
  });

  const onRefundClick = async () => {
    let reason = '';

    const confirmed = await confirm({
      title: m['pages.orders.detail.refund_title'](),
      description: m['pages.orders.detail.refund_description'](),
      confirmText: m['pages.orders.detail.refund_confirm'](),
      cancelText: m['common.cancel'](),
      confirmButton: { variant: 'destructive', disabled: true },
      contentSlot: (
        <div className="flex w-full flex-col gap-2">
          <label htmlFor="refund-reason" className="text-sm font-medium">
            {m['pages.orders.detail.refund_reason_label']()}
          </label>
          <Textarea
            id="refund-reason"
            maxLength={500}
            placeholder={m['pages.orders.detail.refund_reason_placeholder']()}
            onChange={(e) => {
              reason = e.target.value.trim();
              confirm.updateConfig({ confirmButton: { variant: 'destructive', disabled: !reason } });
            }}
          />
        </div>
      ),
    });

    if (confirmed && reason)
      refund(reason);
  };

  const canStartRefund = canRefund
    && onlinePayment.status === OnlinePaymentStatus.COMPLETED
    && (!onlinePayment.refundStatus || onlinePayment.refundStatus === OnlinePaymentRefundStatus.REJECTED);

  const rows: [string, string | null][] = [
    [m['pages.orders.detail.payment_amount'](), `${onlinePayment.amount} ${onlinePayment.currency}`],
    [m['pages.orders.detail.payment_method'](), onlinePayment.paymentMethod],
    [
      m['pages.orders.detail.payment_executed_at'](),
      onlinePayment.executedAt && new Date(onlinePayment.executedAt).toLocaleString(locale),
    ],
    [m['pages.orders.detail.payment_reference'](), onlinePayment.referenceNumber],
    [m['pages.orders.detail.payment_id'](), onlinePayment.paymentId],
    [m['pages.orders.detail.payment_checkout_id'](), onlinePayment.checkoutId],
  ];

  const refundRows: [string, string | null][] = onlinePayment.refundId ? [
    [m['pages.orders.detail.refund_status'](), onlinePayment.refundStatus ? refundStatusLabel[onlinePayment.refundStatus]() : null],
    [m['pages.orders.detail.refund_amount'](), onlinePayment.refundAmount != null ? `${onlinePayment.refundAmount} ${onlinePayment.currency}` : null],
    [m['pages.orders.detail.refund_reason'](), onlinePayment.refundReason],
    [m['pages.orders.detail.refunded_at'](), onlinePayment.refundedAt && new Date(onlinePayment.refundedAt).toLocaleString(locale)],
    [m['pages.orders.detail.refund_id'](), onlinePayment.refundId],
  ] : [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <IconCreditCard className="size-4 text-muted-foreground"/>
          <CardTitle>{m['pages.order_confirmation.online_payment_title']()}</CardTitle>
        </div>
        <Badge variant="secondary">
          <OnlinePaymentStatusIcon status={onlinePayment.status} className="size-3.5"/>
          {onlinePaymentStatusLabel[onlinePayment.status]()}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-sm">
        <DetailRows rows={rows}/>

        {refundRows.length > 0 && (
          <>
            <div className="border-t border-dashed"/>
            <DetailRows rows={refundRows}/>
          </>
        )}
      </CardContent>

      {canStartRefund && (
        <CardFooter className="justify-end">
          <LoadingButton
            size="sm"
            variant="outline"
            loading={isPending}
            loadingText={m['pages.orders.detail.refund_in_progress']()}
            onClick={onRefundClick}
          >
            <IconCreditCardRefund/>
            {m['pages.orders.detail.refund_button']()}
          </LoadingButton>
        </CardFooter>
      )}
    </Card>
  );
};

const DetailRows: FC<{ rows: [string, string | null][] }> = ({ rows }) => (
  <>
    {rows.map(([label, value]) => value && (
      <div key={label} className="flex justify-between gap-3">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-xs break-all text-right">{value}</span>
      </div>
    ))}
  </>
);
