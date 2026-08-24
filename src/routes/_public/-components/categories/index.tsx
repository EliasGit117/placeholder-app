import type { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { IconPhotoOff } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { orpc } from '@/lib/orpc';
import type { ICategoryNodeDto } from '@/features/categories/public/dtos/category-tree.ts';
import { m } from '@/paraglide/messages';
import { Section, SectionHead } from '@/routes/_public/-components/shared';

export const categoriesTreeQuery = orpc.categories.getTree.queryOptions({ input: { depth: 1 } });

export const Categories: FC = () => {
  const { data, isPending } = useQuery(categoriesTreeQuery);
  const categories = data ?? [];

  if (!isPending && categories.length === 0) return null;

  return (
    <Section className="bg-background">
      <SectionHead
        eyebrow={m['pages.home.categories.eyebrow']()}
        title={
          <>
            {m['pages.home.categories.title_prefix']()}{' '}
            <span className="italic text-primary">{m['pages.home.categories.title_highlight']()}</span>
          </>
        }
        right={
          <Button variant="link" className="h-auto p-0 text-foreground" asChild>
            <Link to="/products">{m['pages.home.categories.cta']()} →</Link>
          </Button>
        }
      />

      <Carousel opts={{ align: 'start', loop: true }}>
        <CarouselContent>
          {isPending ? (
            Array.from({ length: 6 }).map((_, i) => (
              <CarouselItem key={i} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 2xl:basis-1/6">
                <div className="space-y-3">
                  <Skeleton className="aspect-square w-full rounded-xl"/>
                  <Skeleton className="h-4 w-2/3"/>
                </div>
              </CarouselItem>
            ))
          ) : (
            categories.map((category) => (
              <CarouselItem key={category.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 2xl:basis-1/6">
                <CategoryCard category={category}/>
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

const CategoryCard: FC<{ category: ICategoryNodeDto }> = ({ category }) => {
  const imageUrl = category.image?.variants.thumb512?.url ?? category.image?.url;

  return (
    <Link
      to="/products"
      search={{ categoryId: category.id }}
      className="group flex flex-col items-start gap-3 text-left"
    >
      <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <IconPhotoOff className="size-8 text-muted-foreground opacity-25"/>
        )}
      </div>
      <div>
        <div className="text-lg font-medium group-hover:text-primary">
          {category.name}
        </div>
        {category.description && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};
