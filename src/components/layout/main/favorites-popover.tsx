import type { ComponentProps, CSSProperties, FC } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { IconHeart, IconPhotoOff, IconTrash, IconX } from '@tabler/icons-react';
import { useFavoritesContext } from '@/providers/favorites.tsx';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { orpc } from '@/lib/orpc';
import { useMediaBreakpoint } from '@/hooks/use-media-breakpoint.ts';


interface IProps extends ComponentProps<typeof Popover> {
  contentClassName?: string;
}

export const FavoritesPopover: FC<IProps> = ({ contentClassName, ...props }) => {
  const { items, remove, clear } = useFavoritesContext();
  const { isBelow: isMobile } = useMediaBreakpoint('sm');
  const ids = [...items];

  const { data: products, isPlaceholderData } = useQuery({
    ...orpc.products.getProductsById.queryOptions({ input: { ids } }),
    placeholderData: keepPreviousData,
    enabled: ids.length > 0,
  });

  return (
    <Popover {...props}>
      <PopoverTrigger asChild>
        <Button size="icon" variant="outline" className="rounded-full relative">
          <IconHeart/>
          <span className='sr-only'>
            {m['components.header.favorites']()}
          </span>

          {items.size > 0 && (
            <span
              className={cn(
                'absolute -top-1.5 -right-1.5 rounded-full size-4 flex items-center justify-center',
                'bg-primary text-primary-foreground text-xs'
              )}
            >
              {items.size}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("gap-0 p-0 w-96", isMobile && "w-screen", contentClassName)}
        align="end"
      >
        <PopoverHeader className="flex-row items-center justify-between border-b p-3">
          <PopoverTitle>
            {m['components.header.favorites']()}
          </PopoverTitle>

          {items.size > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="h-auto gap-1 p-0 text-xs bg-transparent!"
              onClick={clear}
            >
              <IconTrash className="size-3.5"/>
              {m['components.header.favorites_clear']()}
            </Button>
          )}
        </PopoverHeader>

        {ids.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">
            {m['components.header.favorites_empty']()}
          </p>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="p-1">
              {ids.map((id) => {
                const product = products?.[id];

                if (!product) {
                  return isPlaceholderData ?
                    <FavoriteItemSkeleton key={id}/> :
                    <MissingFavoriteItem key={id} id={id} onRemove={remove}/>;
                }

                const imgStyles: CSSProperties = {};
                const thumbhashDataUrl = thumbhashToDataUrl(product.image?.thumbhash ?? null);
                if (thumbhashDataUrl) {
                  imgStyles.backgroundImage = `url(${thumbhashDataUrl})`;
                  imgStyles.backgroundSize = 'cover';
                }
                const imageUrl = product.image?.variants.thumb256?.url ?? product.image?.url;

                return (
                  <li key={id} className={cn('relative flex items-stretch gap-2 p-2', !product.isAvailable && 'opacity-60')}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1 text-muted-foreground opacity-50"
                      aria-label={m['components.header.favorites_remove']()}
                      onClick={() => remove(product.id)}
                    >
                      <IconX/>
                    </Button>

                    <div className="relative size-18 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`${product.name} ${product.variantName}`}
                          style={imgStyles}
                          className="size-full object-cover"
                        />
                      ) : (
                        <IconPhotoOff className="absolute inset-0 m-auto size-5 text-muted-foreground opacity-25"/>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col pr-7">
                      <p className="text-sm font-medium leading-tight">
                        {product.name}
                        <span className="block font-normal">{product.variantName}</span>
                      </p>

                      {product.category && (
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      )}

                      {product.isAvailable ? (
                        <p className="mt-auto flex items-baseline gap-1 text-sm text-primary">
                          {!!product.discountPercent && (
                            <s className="text-xs text-muted-foreground">{product.price}</s>
                          )}
                          <span>{product.finalPrice} {m['components.shop.currency']()}</span>
                        </p>
                      ) : (
                        <p className="mt-auto text-sm text-muted-foreground">
                          {m['components.shop.unavailable']()}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
};

const FavoriteItemSkeleton: FC = () => (
  <li className="flex items-center gap-3 p-3">
    <Skeleton className="size-12 shrink-0 rounded-lg"/>
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-3/4"/>
      <Skeleton className="h-4 w-1/3"/>
    </div>
  </li>
);


const MissingFavoriteItem: FC<{ id: number; onRemove: (id: number) => void }> = ({ id, onRemove }) => (
  <li className="flex items-start gap-2 p-2">
    <div className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10">
      <IconPhotoOff className="size-5 text-muted-foreground opacity-25"/>
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium leading-tight text-muted-foreground">
        {m['components.header.favorites_missing']()}
      </p>
      <p className="text-xs text-muted-foreground opacity-70">
        {m['components.header.favorites_missing_description']()}
      </p>
    </div>

    <Button
      size="icon-sm"
      variant="ghost"
      className="shrink-0 self-center text-muted-foreground opacity-50"
      aria-label={m['components.header.favorites_remove']()}
      onClick={() => onRemove(id)}
    >
      <IconX className="size-4"/>
    </Button>
  </li>
);
