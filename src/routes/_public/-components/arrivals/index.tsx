import type { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/components/product/card.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { orpc } from '@/lib/orpc';
import { SortDirection } from '@/features/shared/schemas/pagination.ts';
import { m } from '@/paraglide/messages';
import { Section, SectionHead } from '@/routes/_public/-components/shared';

export const newArrivalsQuery = orpc.products.search.queryOptions({
  input: { page: 1, limit: 8, sort: 'createdAt', dir: SortDirection.DESC },
});

export const Arrivals: FC = () => {
  const { data, isPending } = useQuery(newArrivalsQuery);
  const products = data?.items ?? [];

  return (
    <Section className="bg-background">
      <SectionHead
        eyebrow={m['pages.home.arrivals.eyebrow']()}
        title={<>{m['pages.home.arrivals.title']()}</>}
        right={
          <Button variant="link" className="h-auto p-0 text-foreground" asChild>
            <Link to="/products">{m['pages.home.arrivals.cta']()} →</Link>
          </Button>
        }
      />

      <Carousel opts={{ align: 'start', loop: true }}>
        <CarouselContent>
          {isPending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <CarouselItem key={i} className="basis-1/2 sm:basis-1/3 md:basis-1/4 2xl:basis-1/5">
                <div className="overflow-hidden rounded-xl border border-border">
                  <Skeleton className="aspect-square w-full rounded-none"/>
                  <div className="space-y-3 p-4">
                    <Skeleton className="h-6 w-2/3"/>
                    <Skeleton className="h-9 w-full"/>
                  </div>
                </div>
              </CarouselItem>
            ))
          ) : (
            products.map((product) => (
              <CarouselItem key={product.id} className="grid basis-1/2 sm:basis-1/3 md:basis-1/4 2xl:basis-1/5">
                <ProductCard product={product}/>
              </CarouselItem>
            ))
          )}
        </CarouselContent>
        <div className="mt-6 flex justify-end gap-2">
          <CarouselPrevious className="static rounded-none active:translate-y-0! translate-x-0 translate-y-0"/>
          <CarouselNext className="static rounded-none active:translate-y-0! translate-x-0 translate-y-0"/>
        </div>
      </Carousel>
    </Section>
  );
};
