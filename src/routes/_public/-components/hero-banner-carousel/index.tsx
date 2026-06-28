import { type FC, type ComponentProps, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import Autoplay from 'embla-carousel-autoplay';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi
} from '@/components/ui/carousel';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import type { TBannerPublicDto } from '@/features/banners/dtos/banner-public.ts';


interface IProps extends ComponentProps<'section'> {
}

const bannerBaseClassName = 'aspect-[3/1] w-full max-h-svh object-cover';
const baseClassName = 'container mx-auto sm:p-4';

const BannerImage: FC<{ banner: TBannerPublicDto }> = ({ banner }) => (
  <a href={banner.href ?? '#'} className="block">
    <img src={banner.image?.url} alt="" className={cn(bannerBaseClassName)}/>
  </a>
);

export const HeroBannerCarousel: FC<IProps> = ({ className, ...props }) => {
  const { data: banners, isPending } = useQuery({
    ...orpc.banners.getValid.queryOptions(),
    placeholderData: keepPreviousData
  });

  const autoplay = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    const onSelect = () => setSelected(api.selectedScrollSnap());
    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  if (isPending) {
    return (
      <section className={cn(baseClassName, className)} {...props}>
        <Skeleton className={cn(bannerBaseClassName)}/>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null;
  }

  if (banners.length === 1) {
    return (
      <section className={cn(baseClassName, className)} {...props}>
        <BannerImage banner={banners[0]}/>
      </section>
    );
  }

  return (
    <section className={cn(baseClassName, className)} {...props}>
      <Carousel
        setApi={setApi}
        plugins={[autoplay.current]}
        opts={{ loop: true }}
        className="group relative"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <BannerImage banner={banner}/>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="absolute bottom-2 right-2 flex items-center bg-black/10 text-white backdrop-blur-2xl">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => api?.scrollPrev()}
            className="grid size-8 place-items-center transition-colors hover:bg-white/20"
          >
            <IconChevronLeft className="size-4.5"/>
          </button>

          <span className="px-1.5 text-center text-sm font-medium tabular-nums">
            {selected + 1}/{banners.length}
          </span>

          <button
            type="button"
            aria-label="Next slide"
            onClick={() => api?.scrollNext()}
            className="grid size-8 place-items-center transition-colors hover:bg-white/20"
          >
            <IconChevronRight className="size-4.5"/>
          </button>
        </div>
      </Carousel>
    </section>
  );
};
