import { type CSSProperties } from 'react';
import { z } from 'zod';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ORPCError } from '@orpc/server';
import { IconCircleCheck, IconPackageOff, IconPhotoOff } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { getLocale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import { capitalizeFirst, thumbhashToDataUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DeliveryMethod } from '~/prisma/generated/prisma/enums.ts';
import { getOrderStatusOption } from '@/routes/admin/orders/-components/order-status.ts';
import { statusLabel, statusContent } from './-consts/order-status.ts';
import { IN_FLIGHT_STATUSES } from './-consts/online-payment-status.ts';
import { OnlinePaymentCard } from './-components/online-payment-card.tsx';

// maib's redirect query params — a UI hint only, never trusted as truth.
const orderSearchSchema = z.object({
  checkoutId: z.string().optional(),
  checkoutStatus: z.string().optional(),
  orderId: z.string().optional()
});

export const Route = createFileRoute('/_public/orders/$uid/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  validateSearch: orderSearchSchema,
  staticData: {
    crumbs: [
      { title: () => m['components.header.products'](), link: { to: '/products' } },
      { title: () => m['pages.order_confirmation.breadcrumb_current']() }
    ]
  },
  loader: async ({ context: { queryClient }, params: { uid } }) => {
    try {
      await queryClient.ensureQueryData(orpc.orders.get.queryOptions({ input: { uid } }));
    } catch (error) {
      if (error instanceof ORPCError && error.code === 'NOT_FOUND')
        throw notFound();

      throw error;
    }
  }
});

function RouteComponent() {
  const { uid } = Route.useParams();
  const { checkoutStatus } = Route.useSearch();
  // Poll while payment is in-flight — a single check can still race maib
  // finalizing the payment even after the server's own live re-sync.
  const { data: order } = useSuspenseQuery({
    ...orpc.orders.get.queryOptions({ input: { uid } }),
    refetchInterval: (query) => {
      const payment = query.state.data?.onlinePayment;
      return payment && IN_FLIGHT_STATUSES.includes(payment.status) ? 2000 : false;
    }
  });
  const confirmingRedirect = checkoutStatus === 'Completed';

  const locale = getLocale();
  const ru = locale === 'ru';
  const content = statusContent[order.status];
  const OrderStatusIcon = getOrderStatusOption(order.status).icon;

  return (
    <main className="flex flex-1 flex-col bg-background min-h-safe-screen mt-2 mb-12">
      <div className="container mx-auto flex max-w-2xl flex-col gap-6 p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <IconCircleCheck className="size-8"/>
          </div>
          <div>
            <h1 className="font-heading text-2xl font-semibold lg:text-3xl">
              {content.title()}
            </h1>
            <p className="text-sm text-muted-foreground">
              {content.description()}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{m['pages.order_confirmation.summary_title']()}</CardTitle>
              <CardDescription>
                {new Date(order.createdAt).toLocaleDateString(ru ? 'ru-RU' : 'ro-RO')}
              </CardDescription>
            </div>
            <Badge variant="secondary">
              <OrderStatusIcon className="size-3.5"/>
              {statusLabel[order.status]()}
            </Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => {
                const productName = item[`productName${capitalizeFirst(locale)}`];
                const variantName = item[`variantName${capitalizeFirst(locale)}`];
                const category = item.category;
                const unitPrice = effectivePrice(item.price, item.discountPercent);

                const imgStyles: CSSProperties = {};
                const thumbhashDataUrl = thumbhashToDataUrl(item.image?.thumbhash ?? null);
                if (thumbhashDataUrl) {
                  imgStyles.backgroundImage = `url(${thumbhashDataUrl})`;
                  imgStyles.backgroundSize = 'cover';
                }
                const imageUrl = item.image?.variants.thumb256?.url ?? item.image?.url;

                const itemContent = (
                  <>
                    <div
                      style={imgStyles}
                      className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted bg-cover bg-center ring-1 ring-foreground/10"
                    >
                      {imageUrl ? (
                        <img src={imageUrl} alt={`${productName} ${variantName}`} className="size-full object-cover"/>
                      ) : (
                        <IconPhotoOff className="absolute inset-0 m-auto size-4 text-muted-foreground opacity-25"/>
                      )}
                    </div>

                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-medium leading-tight">
                        {productName}
                        {item.discountPercent && (
                          <Badge variant="outline" className="rounded-none ml-1.5 px-1 h-3.5 text-[0.65rem]">
                            -{item.discountPercent}%
                          </Badge>
                        )}
                        <span className="block text-sm font-normal">{variantName}</span>
                      </span>
                      {category && (
                        <span className="block text-xs text-muted-foreground">{category}</span>
                      )}
                    </span>
                  </>
                );

                return (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
                    {item.slug ? (
                      <Link
                        to="/products/$slug"
                        params={{ slug: item.slug }}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        {itemContent}
                      </Link>
                    ) : (
                      <span className="flex min-w-0 flex-1 items-center gap-3">{itemContent}</span>
                    )}

                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="text-xs text-muted-foreground">× {item.count}</span>
                      <span className="flex items-baseline gap-1.5">
                        {item.discountPercent && (
                          <s className="text-xs text-muted-foreground">
                            {item.price * item.count}
                          </s>
                        )}
                        <span className="font-medium">
                          {unitPrice * item.count} {m['components.shop.currency']()}
                        </span>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-dashed"/>

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">{m['pages.checkout.summary.total']()}</span>
              <span className="font-heading text-2xl font-semibold">
                {order.totalPrice} <span
                className="text-base font-normal text-muted-foreground">{m['components.shop.currency']()}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {order.onlinePayment && (
          <OnlinePaymentCard onlinePayment={order.onlinePayment} confirmingRedirect={confirmingRedirect}/>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{m['pages.order_confirmation.contact_title']()}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['common.full_name']()}</span>
              <span className="font-medium">{order.fullName}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['pages.checkout.payment.phone']()}</span>
              <span className="font-medium">{order.phone}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['pages.checkout.payment.email']()}</span>
              <span className="font-medium">{order.email}</span>
            </div>

            <div className="border-t border-dashed"/>

            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['pages.checkout.payment.payment_type']()}</span>
              <span className="font-medium">
                {order.onlinePayment ? (
                  m['pages.checkout.payment.payment_type_maib']()
                ) : (
                  m['pages.checkout.payment.payment_type_cash']()
                )}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['pages.checkout.payment.delivery_method']()}</span>
              <span className="font-medium">
                {order.deliveryMethod === DeliveryMethod.PICKUP ? (
                  m['pages.checkout.payment.delivery_pickup']()
                ) : (
                  m['pages.checkout.payment.delivery_courier']()
                )}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['pages.checkout.payment.address']()}</span>
              <span className="font-medium">{order.address}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 min-h-safe-screen">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPackageOff/>
          </EmptyMedia>
          <EmptyTitle>{m['pages.order_confirmation.not_found_title']()}</EmptyTitle>
          <EmptyDescription>{m['pages.order_confirmation.not_found_description']()}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link to="/products">{m['components.shop.back_to_shop']()}</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

function effectivePrice(price: number, discountPercent: number | null): number {
  if (!discountPercent) return price;
  return Math.round(price * (1 - discountPercent / 100));
}
