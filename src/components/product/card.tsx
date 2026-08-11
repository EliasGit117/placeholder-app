import { type FC } from 'react';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardFooter } from '@/components/ui/card';
import { IconHeart, IconPhotoOff, IconShoppingBagPlus, IconTag } from '@tabler/icons-react';
import type { TBriefProductPublicDto } from '@/features/products/public/dtos/search-public-products';
import { m } from '@/paraglide/messages';
import { useFavoritesContext } from '@/providers/favorites.tsx';
import { Skeleton } from "@/components/ui/skeleton";

interface IProps {
  product: TBriefProductPublicDto;
}

export const ProductCard: FC<IProps> = ({ product }) => {
  const { name, shortDescription, category, discountPercent, finalPrice } = product;
  const { items, toggle, isPending: isPendingFavorites } = useFavoritesContext();
  const placeholder = thumbhashToDataUrl(product.thumbhash);
  const hasDiscount = !!discountPercent;
  const isFavorite = items.has(product.id);

  return (
    <article
      itemScope
      itemType="https://schema.org/Product"
      className="group row-span-3 grid grid-rows-subgrid gap-y-0 overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/10 transition-shadow hover:shadow-lg"
    >
      <div
        className={cn(
          'ph-stripes relative grid aspect-square place-items-center overflow-hidden bg-muted bg-cover bg-center',
          'font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground'
        )}
        style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
      >
        {hasDiscount && (
          <Badge variant='secondary' className="absolute left-3 top-3 z-10 rounded-full px-2.5">
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
            <IconHeart className={cn("size-5", isFavorite && "text-red-500 fill-red-500")}/>
          </button>
        ) : (
          <Skeleton className='absolute right-3 top-3 z-10 size-8 rounded-full bg-muted opacity-10'/>
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
          <div className="mb-1 flex items-center gap-1.5 text-xs">
            <IconTag className="size-3.5"/>
            {category}
          </div>
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
        className="@container flex flex-col items-stretch gap-3 self-end border-t border-dashed bg-transparent p-4 pt-3.5 @xs:flex-row @xs:items-center @xs:justify-between">
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

        <Button size="sm" variant="outline-primary" className="@xs:w-auto w-full">
          <IconShoppingBagPlus/>
          <span>
            {m['components.shop.add_to_cart']()}
          </span>
        </Button>
      </CardFooter>
    </article>
  );
};
