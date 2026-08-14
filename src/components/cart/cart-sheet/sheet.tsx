import { type CSSProperties, type FC } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { Button } from '@/components/ui/button.tsx';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { IconMinus, IconPhotoOff, IconPlus, IconTrash, IconX } from '@tabler/icons-react';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { orpc } from '@/lib/orpc';
import { useCartContext } from '@/providers/cart.tsx';
import { useCartSheet } from './provider.tsx';

const cartQuantityOptions = Array.from({ length: 10 }, (_, i) => i + 1);

export const CartSheet: FC = () => {
  const { isOpen, close } = useCartSheet();
  const { items, totalCount, add, remove } = useCartContext();
  const ids = items.map((item) => item.id);

  const { data: products, isPlaceholderData } = useQuery({
    ...orpc.products.getProductsById.queryOptions({ input: { ids } }),
    placeholderData: keepPreviousData,
    enabled: ids.length > 0,
  });

  const total = items.reduce((sum, item) => {
    const product = products?.[item.id];
    return product ? sum + product.finalPrice * item.count : sum;
  }, 0);

  const originalTotal = items.reduce((sum, item) => {
    const product = products?.[item.id];
    return product ? sum + product.price * item.count : sum;
  }, 0);

  const hasTotalDiscount = originalTotal > total;

  const onOpenChange = (v: boolean) => {
    if (v) return;
    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="flex-row items-center justify-between border-b text-left">
          <div>
            <SheetTitle>
              {m['components.header.cart']()}
            </SheetTitle>
            <SheetDescription>{m['components.header.cart_description']()}</SheetDescription>
          </div>

          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label={m['common.close']()}>
              <IconX/>
            </Button>
          </SheetClose>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          {ids.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              {m['components.header.cart_empty']()}
            </p>
          ) : (
            <ul className="space-y-1 p-2">
              {items.map((item) => {
                const product = products?.[item.id];

                if (!product) {
                  return isPlaceholderData ?
                    <CartItemSkeleton key={item.id}/> :
                    <MissingCartItem key={item.id} id={item.id} onRemove={remove}/>;
                }

                const imgStyles: CSSProperties = {};
                const thumbhashDataUrl = thumbhashToDataUrl(product.thumbhash);
                if (thumbhashDataUrl) {
                  imgStyles.backgroundImage = `url(${thumbhashDataUrl})`;
                  imgStyles.backgroundSize = 'cover';
                }

                return (
                  <li
                    key={item.id}
                    className={cn('flex items-start gap-3 rounded-lg p-2', !product.isAvailable && 'opacity-60')}
                  >
                    <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
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
                          <p className="text-sm text-muted-foreground">
                            {m['components.shop.unavailable']()}
                          </p>
                        )}
                      </div>

                      <ButtonGroup className="mt-1.5">
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="outline"
                          className="shadow-none"
                          disabled={item.count <= 1}
                          onClick={() => add(item.id, -1)}
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

                          <DropdownMenuContent className='min-w-16' align="start">
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
                        className="text-muted-foreground opacity-50 -mr-1.5 -mt-1.5"
                        aria-label={m['components.shop.remove_from_cart']()}
                        onClick={() => remove(item.id)}
                      >
                        <IconTrash/>
                      </Button>

                      {product.isAvailable && (
                        <span className="flex items-baseline gap-1 whitespace-nowrap">
                          {!!product.discountPercent && (
                            <s className="text-xs text-muted-foreground">
                              {product.price * item.count}
                            </s>
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
          )}
        </ScrollArea>

        <SheetFooter className="flex flex-col gap-4 border-t pt-3.5">
          {items.length > 0 && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-muted-foreground">
                {m['components.header.cart_total']()}
                {' · '}
                {m['components.header.cart_items_count']({ count: totalCount })}
              </span>
              <span className="flex flex-col items-end">
                {hasTotalDiscount && (
                  <s className="text-xs text-muted-foreground">
                    {originalTotal} {m['components.shop.currency']()}
                  </s>
                )}
                <span className="font-heading text-lg font-semibold">
                  {total} {m['components.shop.currency']()}
                </span>
              </span>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

const CartItemSkeleton: FC = () => (
  <li className="flex items-center gap-3 p-2">
    <Skeleton className="size-24 shrink-0 rounded-lg"/>
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4"/>
      <Skeleton className="h-4 w-1/3"/>
    </div>
  </li>
);

const MissingCartItem: FC<{ id: number; onRemove: (id: number) => void }> = ({ id, onRemove }) => (
  <li className="flex items-start gap-3 p-2">
    <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
      <IconPhotoOff className="size-6 text-muted-foreground opacity-25"/>
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium leading-tight text-muted-foreground">
        {m['components.header.cart_missing']()}
      </p>
      <p className="text-xs text-muted-foreground opacity-70">
        {m['components.header.cart_missing_description']()}
      </p>
    </div>

    <Button
      size="icon-sm"
      variant="ghost"
      className="shrink-0 self-center text-muted-foreground opacity-50"
      aria-label={m['components.shop.remove_from_cart']()}
      onClick={() => onRemove(id)}
    >
      <IconX className="size-4"/>
    </Button>
  </li>
);
