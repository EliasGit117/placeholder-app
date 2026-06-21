import { useState, useEffect, type FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import Autoplay from 'embla-carousel-autoplay';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, type CarouselApi } from '@/components/ui/carousel';
import { BannerSlide } from './banner-slide.tsx';
import { m } from '@/paraglide/messages';

interface IProps {
  withVerticalShadow?: boolean;
}

export const HeroBannerCarousel: FC<IProps> = ({ withVerticalShadow }) => {
  const [mounted, setMounted] = useState(false);
  const { data: banners, isPending } = useQuery(orpc.banners.getActive.queryOptions());

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on('select', () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api]);

  if (!mounted) return null;
  if (isPending) return <div className="w-full h-svh bg-muted animate-pulse" />;
  if (!banners?.length) return null;

  return (
    <section className="relative w-full">
      {withVerticalShadow && (
        <>
          <div className="absolute inset-x-0 top-0 z-10 h-24 bg-linear-to-b from-black/25 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-black/25 to-transparent pointer-events-none" />
        </>
      )}
      <Carousel
        opts={{ loop: true }}
        plugins={[Autoplay({ delay: 4000 })]}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="ml-0">
          {banners.map((item, index) => (
            <BannerSlide key={item.banner.id} item={item} index={index} />
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={m['pages.home.hero_banners.previous_slide']()}
          className="rounded-none text-white hover:text-white/70"
          onClick={() => api?.scrollPrev()}
        >
          <IconChevronLeft className="size-4" aria-hidden />
        </Button>

        <div className="flex items-center">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              aria-label={`Slide ${index + 1}`}
              aria-pressed={current === index + 1}
              className={cn(
                'h-0.5 w-8 transition-all duration-300',
                current === index + 1 ? 'bg-white' : 'bg-white/50',
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={m['pages.home.hero_banners.next_slide']()}
          className="rounded-none text-white hover:text-white/70"
          onClick={() => api?.scrollNext()}
        >
          <IconChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
