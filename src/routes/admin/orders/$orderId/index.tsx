import { type CSSProperties } from 'react';
import { createFileRoute, Link, notFound, redirect } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ORPCError } from '@orpc/server';
import {
  IconBuildingStore,
  IconChevronDown,
  IconHome,
  IconMapPin,
  IconPhotoOff,
  IconShoppingBag,
  IconShoppingBagX,
  IconTruckDelivery
} from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import type { IBreadcrumb } from '@/components/layout/common/breadcrumbs.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DeliveryMethod } from '~/prisma/generated/prisma/enums.ts';
import { getOrderStatusOption, orderStatusOptions } from '../-components/order-status.ts';


export const Route = createFileRoute('/admin/orders/$orderId/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  params: {
    parse: ({ orderId }) => ({ orderId: parseInt(orderId, 10) }),
    stringify: ({ orderId }) => ({ orderId: String(orderId) })
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { orders: ['get'] });
    if (!canGet)
      throw redirect({ to: '/admin/orders', replace: true });

    const canUpdate = await roleHasPermission(user?.role, { orders: ['update'] });
    return { canUpdate };
  },
  loader: async ({ context: { queryClient }, params: { orderId } }) => {
    if (!Number.isInteger(orderId))
      throw notFound();

    let order;
    try {
      order = await queryClient.fetchQuery(orpc.admin.orders.get.queryOptions({ input: { id: orderId } }));
    } catch (error) {
      if (error instanceof ORPCError && error.code === 'NOT_FOUND')
        throw notFound();

      throw error;
    }

    if (!order)
      throw notFound();

    const crumbs: IBreadcrumb[] = [{ title: `«${order.uid.slice(0, 8)}»` }];
    return { crumbs, order };
  }
});


function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon"><IconShoppingBagX/></EmptyMedia>
          <EmptyTitle>{m['pages.orders.not_found']()}</EmptyTitle>
          <EmptyDescription>{m['pages.orders.not_found_description']()}</EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin">
              <IconHome/>
              <span>{m['common.home']()}</span>
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link to="/admin/orders">
              <IconShoppingBag/>
              <span>{m['pages.orders.title']()}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}

function effectivePrice(price: number, discountPercent: number | null): number {
  if (!discountPercent) return price;
  return Math.round(price * (1 - discountPercent / 100));
}

function RouteComponent() {
  const { orderId } = Route.useParams();
  const { canUpdate } = Route.useRouteContext();
  const { order: initialOrder } = Route.useLoaderData();
  const queryClient = useQueryClient();
  const ru = getLocale() === 'ru';

  const { data: order } = useQuery({
    ...orpc.admin.orders.get.queryOptions({ input: { id: orderId } }),
    initialData: initialOrder
  });

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: (typeof orderStatusOptions)[number]['value']) =>
      orpc.admin.orders.updateStatus.call({ id: orderId, status }),
    onSuccess: () => {
      toast.success(m['pages.orders.detail.save_success']());
      void queryClient.invalidateQueries({ queryKey: orpc.admin.orders.get.key() });
      void queryClient.invalidateQueries({ queryKey: orpc.admin.orders.search.key() });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    }
  });

  if (!order)
    return null;

  const statusOption = getOrderStatusOption(order.status);
  const StatusIcon = statusOption.icon;

  return (
    <div className="@container space-y-4">
      <div className="grid grid-cols-1 @5xl:grid-cols-3 gap-4">
        <Card className="@5xl:col-span-2">
          <CardHeader>
            <CardTitle>{m['pages.orders.detail.section_general']()}</CardTitle>
            <CardDescription>{m['pages.orders.detail.section_general_description']()}</CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">{m['common.id']()}</span>
              <span className="font-mono text-xs">{order.uid}</span>
            </div>
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
              {order.deliveryMethod === DeliveryMethod.PICKUP ? <IconBuildingStore className="size-4"/> :
                <IconTruckDelivery className="size-4"/>}
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

        <Card>
          <CardHeader>
            <CardTitle>{m['pages.orders.detail.status_label']()}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-start" disabled={!canUpdate || isPending}>
                  <StatusIcon className="text-muted-foreground" size={16}/>
                  <span>{statusOption.label()}</span>
                  <IconChevronDown className="ml-auto opacity-50" size={16}/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
                <DropdownMenuRadioGroup value={order.status}
                                        onValueChange={(v) => updateStatus(v as typeof order.status)}>
                  {orderStatusOptions.map(({ value, label, icon: Icon }) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      <Icon className="text-muted-foreground" size={16}/>
                      <span>{label()}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{m['common.created']()}</span>
              <span>{new Date(order.createdAt).toLocaleDateString(ru ? 'ru-RU' : 'ro-RO')}</span>
            </div>
          </CardContent>

          <CardFooter className="mt-auto justify-between">
            <span className="text-base font-semibold">{m['pages.checkout.summary.total']()}</span>
            <span className="font-heading text-xl font-semibold">
              {order.totalPrice} <span
              className="text-sm font-normal text-muted-foreground">{m['components.shop.currency']()}</span>
            </span>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{m['pages.orders.detail.section_items']()}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-3">
            {order.items.map((item) => {
              const productName = ru ? item.productNameRu : item.productNameRo;
              const variantName = ru ? item.variantNameRu : item.variantNameRo;
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
                    {item.category && (
                      <span className="block text-xs text-muted-foreground">{item.category}</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
