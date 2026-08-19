import { type CSSProperties } from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ORPCError } from '@orpc/server';
import { IconBuildingStore, IconCircleCheck, IconMapPin, IconPackageOff, IconPhotoOff, IconTruckDelivery } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { getLocale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import { thumbhashToDataUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { DeliveryMethod, OrderStatus } from '~/prisma/generated/prisma/enums.ts';
import type { TOrderDto } from '@/features/orders/common/dtos/order.ts';

export const Route = createFileRoute('/_public/orders/$uid/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
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
  },
});

function RouteComponent() {
  const { uid } = Route.useParams();
  const { data: order } = useSuspenseQuery(orpc.orders.get.queryOptions({ input: { uid } }));

  return <OrderConfirmation order={order}/>;
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

const statusLabel: Record<OrderStatus, () => string> = {
  [OrderStatus.PENDING]: () => m['enums.order_status.pending'](),
  [OrderStatus.PROCESSING]: () => m['enums.order_status.processing'](),
  [OrderStatus.SHIPPED]: () => m['enums.order_status.shipped'](),
  [OrderStatus.COMPLETED]: () => m['enums.order_status.completed'](),
  [OrderStatus.CANCELLED]: () => m['enums.order_status.cancelled'](),
};

const statusContent: Record<OrderStatus, { title: () => string; description: () => string }> = {
  [OrderStatus.PENDING]: {
    title: () => m['pages.order_confirmation.status.pending.title'](),
    description: () => m['pages.order_confirmation.status.pending.description'](),
  },
  [OrderStatus.PROCESSING]: {
    title: () => m['pages.order_confirmation.status.processing.title'](),
    description: () => m['pages.order_confirmation.status.processing.description'](),
  },
  [OrderStatus.SHIPPED]: {
    title: () => m['pages.order_confirmation.status.shipped.title'](),
    description: () => m['pages.order_confirmation.status.shipped.description'](),
  },
  [OrderStatus.COMPLETED]: {
    title: () => m['pages.order_confirmation.status.completed.title'](),
    description: () => m['pages.order_confirmation.status.completed.description'](),
  },
  [OrderStatus.CANCELLED]: {
    title: () => m['pages.order_confirmation.status.cancelled.title'](),
    description: () => m['pages.order_confirmation.status.cancelled.description'](),
  },
};

function effectivePrice(price: number, discountPercent: number | null): number {
  if (!discountPercent) return price;
  return Math.round(price * (1 - discountPercent / 100));
}

function OrderConfirmation({ order }: { order: TOrderDto }) {
  const ru = getLocale() === 'ru';
  const content = statusContent[order.status];

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
            <Badge variant="secondary">{statusLabel[order.status]()}</Badge>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => {
                const productName = ru ? item.productNameRu : item.productNameRo;
                const variantName = ru ? item.variantNameRu : item.variantNameRo;
                const category = item.category;
                const unitPrice = effectivePrice(item.price, item.discountPercent);

                const imgStyles: CSSProperties = {};
                const thumbhashDataUrl = thumbhashToDataUrl(item.image?.thumbhash ?? null);
                if (thumbhashDataUrl) {
                  imgStyles.backgroundImage = `url(${thumbhashDataUrl})`;
                  imgStyles.backgroundSize = 'cover';
                }
                const imageUrl = item.image?.variants.thumb256?.url ?? item.image?.url;

                return (
                  <li key={item.id} className="flex items-center gap-3 text-sm">
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
                        <span className="block text-sm font-normal">{variantName}</span>
                      </span>
                      {category && (
                        <span className="block text-xs text-muted-foreground">{category}</span>
                      )}
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="text-xs text-muted-foreground">× {item.count}</span>
                      <span className="font-medium">
                        {unitPrice * item.count} {m['components.shop.currency']()}
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
                {order.totalPrice} <span className="text-base font-normal text-muted-foreground">{m['components.shop.currency']()}</span>
              </span>
            </div>
          </CardContent>
        </Card>

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

            <div className="flex items-center gap-2 text-muted-foreground">
              {order.deliveryMethod === DeliveryMethod.PICKUP ? <IconBuildingStore className="size-4"/> : <IconTruckDelivery className="size-4"/>}
              <span>
                {order.deliveryMethod === DeliveryMethod.PICKUP
                  ? m['pages.checkout.payment.delivery_pickup']()
                  : m['pages.checkout.payment.delivery_courier']()}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <IconMapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground"/>
              <span>{order.address}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
