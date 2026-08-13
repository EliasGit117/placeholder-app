import { type FC } from 'react';
import { Link } from '@tanstack/react-router';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { CardContent, CardFooter } from '@/components/ui/card';
import {
  IconHeart,
  IconPhotoOff,
  IconShoppingBagMinus,
  IconShoppingBagPlus,
  IconTag
} from '@tabler/icons-react';
import type { TBriefProductPublicDto } from '@/features/products/public/dtos/search-public-products';
import { m } from '@/paraglide/messages';
import { useFavoritesContext } from '@/providers/favorites.tsx';
import { useCartContext } from '@/providers/cart.tsx';
import { Skeleton } from '@/components/ui/skeleton';

const CART_QUANTITY_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

interface IProps {
  product: TBriefProductPublicDto;
}

export const ProductCard: FC<IProps> = ({ product }) => {
  const { name, shortDescription, category, categoryId, discountPercent, finalPrice, isAvailable } = product;
  const { items, toggle, isPending: isPendingFavorites } = useFavoritesContext();
  const { items: cartItems, add: addToCart, remove: removeFromCart } = useCartContext();
  const imgPlaceholder = thumbhashToDataUrl(product.thumbhash);
  const hasDiscount = !!discountPercent;
  const isFavorite = items.has(product.id);
  const cartItem = cartItems.find((item) => item.id === product.id);

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className={cn(
        'group row-span-3 grid grid-rows-subgrid gap-y-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg',
        !isAvailable && 'opacity-70'
      )}
    >
      <div
        style={imgPlaceholder ? { backgroundImage: `url(${imgPlaceholder})` } : undefined}
        className={cn(
          'ph-stripes relative grid aspect-square place-items-center overflow-hidden bg-muted bg-cover bg-center',
          'uppercase tracking-[0.15em] font-semibold text-muted-foreground'
        )}
      >

        {hasDiscount && (
          <Badge variant="secondary" className="absolute left-3 top-3 z-10 rounded-full px-2.5">
            -{discountPercent}%
          </Badge>
        )}

        {!isPendingFavorites ? (
          <button
            type="button"
            aria-label={m['components.shop.wishlist']()}
            onClick={() => toggle(product.id)}
            className={cn(
              'absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full',
              'bg-white/50 text-muted-foreground/75 backdrop-blur-xl transition-colors',
              isFavorite && 'bg-red-300/25 backdrop-blur-sm'
            )}
          >
            <IconHeart className={cn('size-5', isFavorite && 'text-red-500 fill-red-500')}/>
          </button>
        ) : (
          <Skeleton className="absolute right-3 top-3 z-10 size-8 rounded-full bg-muted opacity-10"/>
        )}


        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
            itemProp="image"
          />
        ) : (
          <IconPhotoOff className="size-10 text-muted-foreground opacity-25"/>
        )}
      </div>

      <CardContent className="flex flex-col gap-1.5 p-4">
        {category && (
          categoryId != null ? (
            <Link
              to="/products"
              search={{ categoryId }}
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 mb-1 flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
            >
              <IconTag className="size-3.5"/>
              {category}
            </Link>
          ) : (
            <div className="mb-1 flex items-center gap-1.5 text-xs">
              <IconTag className="size-3.5"/>
              {category}
            </div>
          )
        )}

        <h3 className="font-heading text-base font-semibold leading-tight" itemProp="name">
          {name}
        </h3>

        {shortDescription && (
          <p className="line-clamp-2 text-[13px] text-muted-foreground">
            {shortDescription}
          </p>
        )}
      </CardContent>

      <CardFooter
        className="flex flex-col items-stretch gap-3 self-end border-t border-dashed bg-transparent p-4 pt-3.5">
        <div className="flex items-center justify-between gap-2">
          <div
            className="flex items-baseline gap-1.5"
            itemProp="offers"
            itemScope
            itemType="https://schema.org/Offer"
          >
            <meta itemProp="priceCurrency" content="EUR"/>
            {hasDiscount && (
              <s className="text-xs text-muted-foreground">{product.price}</s>
            )}

            <span className="font-heading text-lg font-semibold" itemProp="price">{finalPrice}</span>
            <small className="text-[13px] text-muted-foreground">
              {m['components.shop.currency']()}
            </small>
          </div>

          {cartItem && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="aspect-square px-0 -mr-1"
                  aria-label={m['components.shop.cart_options']()}
                >
                  <span>x{cartItem.count}</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-10">
                {CART_QUANTITY_OPTIONS.map((quantity) => (
                  <DropdownMenuItem
                    key={quantity}
                    className={cn('justify-center', quantity === cartItem.count && 'bg-foreground/10')}
                    onClick={() => addToCart(product.id, quantity - cartItem.count)}
                  >
                    {quantity}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {cartItem ? (
          <Button
            size="sm"
            variant="outline-primary"
            className="w-full"
            disabled={!isAvailable}
            onClick={() => removeFromCart(product.id)}
          >
            <IconShoppingBagMinus/>
            <span>{m['components.shop.remove_from_cart']()}</span>
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline-primary"
            className="w-full"
            disabled={!isAvailable}
            onClick={() => addToCart(product.id)}
          >
            <IconShoppingBagPlus/>
            <span>
              {isAvailable ? m['components.shop.add_to_cart']() : m['components.shop.unavailable']()}
            </span>
          </Button>
        )}
      </CardFooter>
    </article>
  );
};
