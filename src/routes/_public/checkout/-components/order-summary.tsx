import { type CSSProperties, type FC } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { IconMinus, IconPackageOff, IconPhotoOff, IconPlus, IconTrash } from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { orpc } from '@/lib/orpc';
import { useCartContext } from '@/providers/cart.tsx';

const cartQuantityOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export const OrderSummary: FC = () => {
  const { items, add, remove } = useCartContext();
  const ids = items.map((item) => item.id);

  const { data: products, isPending: productsPending } = useQuery({
    ...orpc.products.getProductsById.queryOptions({ input: { ids } }),
    placeholderData: keepPreviousData,
    enabled: ids.length > 0,
  });

  const total = items.reduce((sum, item) => {
    const product = products?.[item.id];
    return product && product.isAvailable ? sum + product.finalPrice * item.count : sum;
  }, 0);

  const originalTotal = items.reduce((sum, item) => {
    const product = products?.[item.id];
    return product && product.isAvailable ? sum + product.price * item.count : sum;
  }, 0);

  const hasTotalDiscount = originalTotal > total;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconPackageOff/>
              </EmptyMedia>
              <EmptyTitle>{m['pages.checkout.summary.empty_title']()}</EmptyTitle>
              <EmptyDescription>{m['pages.checkout.summary.empty_description']()}</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild variant="outline">
                <Link to="/products">{m['components.shop.back_to_shop']()}</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  if (productsPending) {
    return <SummarySkeleton itemCount={items.length}/>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{m['pages.checkout.summary.title']()}</CardTitle>
        <CardDescription>{m['pages.checkout.summary.description']()}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const product = products?.[item.id];

            if (!product) return null;

            const imgStyles: CSSProperties = {};
            const thumbhashDataUrl = thumbhashToDataUrl(product.image?.thumbhash ?? null);
            if (thumbhashDataUrl) {
              imgStyles.backgroundImage = `url(${thumbhashDataUrl})`;
              imgStyles.backgroundSize = 'cover';
            }
            const imageUrl = product.image?.variants.thumb256?.url ?? product.image?.url;

            return (
              <li key={item.id} className={cn('flex items-start gap-3', !product.isAvailable && 'opacity-60')}>
                <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${product.name} ${product.variantName}`}
                      style={imgStyles}
                      className="size-full object-cover"
                    />
                  ) : (
                    <IconPhotoOff className="absolute inset-0 m-auto size-6 text-muted-foreground opacity-25"/>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                  <div className="space-y-1.5">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-tight">
                        {product.name}
                        <span className="block text-sm font-normal">{product.variantName}</span>
                      </p>

                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      )}
                    </div>

                    {!product.isAvailable && (
                      <p className="text-sm text-muted-foreground">{m['components.shop.unavailable']()}</p>
                    )}
                  </div>

                  <ButtonGroup className="mt-1.5">
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      className="shadow-none"
                      onClick={() => item.count > 1 && add(item.id, -1)}
                      aria-label={m['components.shop.decrease_quantity']()}
                    >
                      <IconMinus/>
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          className="min-w-10 shadow-none"
                          aria-label={m['components.shop.cart_options']()}
                        >
                          <span>{item.count}</span>
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="min-w-16" align="start">
                        {cartQuantityOptions.map((quantity) => (
                          <DropdownMenuItem
                            key={quantity}
                            className={cn('justify-center', quantity === item.count && 'bg-foreground/10')}
                            onClick={() => add(item.id, quantity - item.count)}
                          >
                            {quantity}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                      type="button"
                      size="icon-xs"
                      variant="outline"
                      className="shadow-none"
                      onClick={() => add(item.id, 1)}
                      aria-label={m['components.shop.increase_quantity']()}
                    >
                      <IconPlus/>
                    </Button>
                  </ButtonGroup>
                </div>

                <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="-mr-1.5 -mt-1.5 text-muted-foreground opacity-50"
                    aria-label={m['components.shop.remove_from_cart_full']()}
                    onClick={() => remove(item.id)}
                  >
                    <IconTrash/>
                  </Button>

                  {product.isAvailable && (
                    <span className="flex items-baseline gap-1 whitespace-nowrap">
                      {!!product.discountPercent && (
                        <s className="text-xs text-muted-foreground">{product.price * item.count}</s>
                      )}
                      <span className={cn('font-heading text-base', !!product.discountPercent && 'text-primary')}>
                        {product.finalPrice * item.count} {m['components.shop.currency']()}
                      </span>
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-dashed"/>

        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">
            {m['pages.checkout.summary.total']()}
            {' · '}
            <span className="font-normal text-muted-foreground">
              {m['components.header.cart_items_count']({ count: items.reduce((sum, item) => sum + item.count, 0) })}
            </span>
          </span>
          <span className="flex items-baseline gap-1.5">
            {hasTotalDiscount && (
              <s className="text-sm text-muted-foreground">{originalTotal}</s>
            )}
            <span className="font-heading text-2xl font-semibold">
              {total} <span className="text-base font-normal text-muted-foreground">{m['components.shop.currency']()}</span>
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const SummarySkeleton: FC<{ itemCount: number }> = ({ itemCount }) => (
  <Card>
    <CardHeader>
      <Skeleton className="h-5 w-32"/>
      <Skeleton className="h-4 w-48"/>
    </CardHeader>

    <CardContent className="flex flex-col gap-4">
      <ul className="flex flex-col gap-4">
        {Array.from({ length: itemCount }, (_, i) => <ItemSkeleton key={i}/>)}
      </ul>

      <div className="border-t border-dashed"/>

      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16"/>
        <Skeleton className="h-7 w-24"/>
      </div>
    </CardContent>
  </Card>
);

const ItemSkeleton: FC = () => (
  <li className="flex items-center gap-3">
    <Skeleton className="size-24 shrink-0 rounded-lg"/>
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4"/>
      <Skeleton className="h-3 w-1/3"/>
    </div>
  </li>
);
