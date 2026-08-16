import { useState } from 'react';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ORPCError } from '@orpc/server';
import {
  IconHeart,
  IconHome,
  IconMinus,
  IconPackageOff,
  IconPhotoOff,
  IconPlus,
  IconShoppingBagMinus,
  IconShoppingBagPlus,
  IconTag
} from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { useCartContext } from '@/providers/cart.tsx';
import { useFavoritesContext } from '@/providers/favorites.tsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { SimilarProducts } from './-components/similar-products.tsx';
import type { TProductDetailsDto } from '@/features/products/public/dtos/product-details';

export const Route = createFileRoute('/_public/products/$slug/')({
  component: RouteComponent,
  notFoundComponent: NotFound,
  pendingComponent: ProductSkeleton,
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    try {
      await queryClient.ensureQueryData(orpc.products.getBySlug.queryOptions({ input: { slug } }));
    } catch (error) {
      if (error instanceof ORPCError && error.code === 'NOT_FOUND')
        throw notFound();

      throw error;
    }
  }
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(orpc.products.getBySlug.queryOptions({ input: { slug } }));

  return <ProductDetail key={slug} product={product}/>;
}

function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 min-h-safe-screen">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPackageOff/>
          </EmptyMedia>
          <EmptyTitle>{m['components.shop.not_found_title']()}</EmptyTitle>
          <EmptyDescription>{m['components.shop.not_found_description']()}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link to="/products">
              <IconHome/>
              <span>{m['components.shop.back_to_shop']()}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}

function ProductDetail({ product }: { product: TProductDetailsDto }) {
  const locale = getLocale();
  const ru = locale === 'ru';

  const [activeImage, setActiveImage] = useState(0);

  const variant = product.variants.find((v) => v.id === product.selectedVariantId) ?? product.variants[0];

  const { items: cartItems, add: addToCart, remove: removeFromCart } = useCartContext();
  const { items: favorites, toggle: toggleFavorite, isPending: isPendingFavorites } = useFavoritesContext();

  const cartItem = cartItems.find((item) => item.id === variant.id);
  const isFavorite = favorites.has(variant.id);
  const hasDiscount = !!variant.discountPercent;

  const images = variant.images;
  const image = images[activeImage] ?? images[0];
  const imgPlaceholder = thumbhashToDataUrl(image?.thumbhash ?? null);

  return (
    <main className="flex flex-col flex-1 bg-background min-h-safe-screen mt-2 mb-12">
      <div className="container mx-auto flex flex-col gap-8 p-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground hover:underline underline-offset-2">
            {m['common.home']()}
          </Link>
          {product.category && (
            <>
              <span>/</span>
              {product.categoryId != null ? (
                <Link
                  to="/products"
                  search={{ categoryId: product.categoryId }}
                  className="hover:text-foreground hover:underline underline-offset-2"
                >
                  {product.category}
                </Link>
              ) : (
                <span>{product.category}</span>
              )}
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div className="flex flex-col gap-3">
            <div
              style={imgPlaceholder ? { backgroundImage: `url(${imgPlaceholder})` } : undefined}
              className="ph-stripes relative aspect-square overflow-hidden rounded-2xl bg-muted bg-cover bg-center"
            >
              {image ? (
                <img
                  src={image.variants.thumb1024?.url ?? image.variants.thumb512?.url ?? image.url}
                  alt={`${product.name} ${variant.name}`}
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <IconPhotoOff className="size-10 text-muted-foreground opacity-25"/>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, i) => {
                  const thumbPlaceholder = thumbhashToDataUrl(img.thumbhash ?? null);

                  return (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      style={thumbPlaceholder ? { backgroundImage: `url(${thumbPlaceholder})` } : undefined}
                      className={cn(
                        'aspect-square overflow-hidden rounded-lg bg-muted bg-cover bg-center ring-1 ring-foreground/10 transition-shadow',
                        i === activeImage && 'ring-2 ring-primary'
                      )}
                    >
                      <img
                        src={img.variants.thumb256?.url ?? img.url}
                        alt=""
                        className="size-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              {product.category && (
                <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconTag className="size-3.5"/>
                  {product.category}
                </div>
              )}

              <h1 className="font-heading text-2xl font-semibold leading-tight lg:text-3xl">
                {product.name}
                <span className="block text-base font-normal">{variant.name}</span>
              </h1>
            </div>

            <div className="flex items-baseline gap-1.5">
              {hasDiscount && <s className="text-sm text-muted-foreground">{variant.price}</s>}
              <span className="font-heading text-2xl font-semibold">
                {variant.finalPrice}
              </span>
              <small className="text-sm font-semibold">
                {m['components.shop.currency']()}
              </small>

              {hasDiscount && (
                <Badge variant="secondary" className="rounded-full self-center ml-1">
                  -{variant.discountPercent}%
                </Badge>
              )}
            </div>

            {product.shortDescription && <p className="text-sm">{product.shortDescription}</p>}

            {Object.entries(product.options).map(([key, option]) => {
              const optionName = ru ? option.nameRu : option.nameRo;

              return (
                <div key={key} className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{optionName}</span>

                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const match = product.variants.find((v) =>
                        Object.keys(product.options).every((k) =>
                          k === key ? v.optionValues[k] === value.value : v.optionValues[k] === variant.optionValues[k]
                        )
                      ) ?? product.variants.find((v) => v.optionValues[key] === value.value);

                      const isSelected = variant.optionValues[key] === value.value;
                      const label = ru ? value.nameRu : value.nameRo;

                      if (!match || isSelected) {
                        return (
                          <Button
                            key={value.value}
                            type="button"
                            size="sm"
                            variant={isSelected ? 'default' : 'outline'}
                            disabled={!match}
                          >
                            {label}
                          </Button>
                        );
                      }

                      return (
                        <Button key={value.value} type="button" size="sm" variant="outline" asChild>
                          <Link to="/products/$slug" params={{ slug: match.slug }}>
                            {label}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!variant.isAvailable && (
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-block size-2 rounded-full bg-destructive"/>
                <span className="text-muted-foreground">{m['components.shop.unavailable']()}</span>
              </div>
            )}

            <div className="border-t border-dashed"/>

            {cartItem ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-stretch gap-2">
                  <Button
                    type="button"
                    className="w-full max-w-xs"
                    onClick={() => removeFromCart(variant.id)}
                  >
                    <IconShoppingBagMinus/>
                    <span>{m['components.shop.remove_from_cart_full']()}</span>
                  </Button>

                  {!isPendingFavorites && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      aria-label={m['components.shop.wishlist']()}
                      onClick={() => toggleFavorite(variant.id)}
                    >
                      <IconHeart className={cn('size-4.5', isFavorite && 'text-primary fill-primary')}/>
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{m['components.shop.quantity']()}</span>
                  <div className="flex w-fit items-center rounded-lg border">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-r-none"
                      aria-label={m['components.shop.decrease_quantity']()}
                      onClick={() => (cartItem.count <= 1 ? removeFromCart(variant.id) : addToCart(variant.id, -1))}
                    >
                      <IconMinus className="size-3.5"/>
                    </Button>
                    <span className="w-10 text-center text-sm tabular-nums">{cartItem.count}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="rounded-l-none"
                      aria-label={m['components.shop.increase_quantity']()}
                      onClick={() => addToCart(variant.id, 1)}
                    >
                      <IconPlus className="size-3.5"/>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-stretch gap-2">
                <Button
                  className="w-full max-w-xs"
                  variant="outline-primary"
                  disabled={!variant.isAvailable}
                  onClick={() => addToCart(variant.id, 1)}
                >
                  <IconShoppingBagPlus/>
                  <span>{m['components.shop.add_to_cart']()}</span>
                </Button>

                {!isPendingFavorites && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={m['components.shop.wishlist']()}
                    onClick={() => toggleFavorite(variant.id)}
                  >
                    <IconHeart className={cn('size-4.5', isFavorite && 'text-primary fill-primary')}/>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {product.description && (
          <div>
            <Separator className="mb-6"/>
            <h2 className="mb-2 font-heading text-lg font-semibold">
              {m['components.shop.description_title']()}
            </h2>
            <div
              className={cn(
                'prose prose-sm max-w-none',
                '[--tw-prose-body:var(--muted-foreground)] [--tw-prose-headings:var(--foreground)]',
                '[--tw-prose-bold:var(--foreground)] [--tw-prose-links:var(--foreground)]',
                '[--tw-prose-bullets:var(--muted-foreground)] [--tw-prose-counters:var(--muted-foreground)]',
                '[--tw-prose-hr:var(--border)] [--tw-prose-quotes:var(--foreground)] [--tw-prose-quote-borders:var(--border)]',
                '[--tw-prose-code:var(--foreground)] [--tw-prose-th-borders:var(--border)] [--tw-prose-td-borders:var(--border)]'
              )}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}

        {product.categoryId != null && (
          <SimilarProducts
            categoryId={product.categoryId}
            excludeSlugs={product.variants.map((v) => v.slug)}
          />
        )}
      </div>
    </main>
  );
}

function ProductSkeleton() {
  return (
    <main className="flex flex-col flex-1 bg-background min-h-safe-screen">
      <div className="container mx-auto flex flex-col gap-8 p-4">
        <Skeleton className="h-4 w-56"/>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
          <div className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-2xl"/>
            <div className="grid grid-cols-5 gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg"/>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24"/>
              <Skeleton className="h-8 w-2/3"/>
              <Skeleton className="h-4 w-16"/>
            </div>

            <Skeleton className="h-8 w-40"/>
            <Skeleton className="h-10 w-full"/>

            <div className="space-y-2">
              <Skeleton className="h-4 w-16"/>
              <Skeleton className="h-9 w-24"/>
            </div>

            <Separator/>

            <Skeleton className="h-9 w-40"/>

            <div className="flex items-stretch gap-2">
              <Skeleton className="h-10 flex-1"/>
              <Skeleton className="h-10 w-10"/>
            </div>

            <Skeleton className="h-10 w-full"/>
          </div>
        </div>
      </div>
    </main>
  );
}
