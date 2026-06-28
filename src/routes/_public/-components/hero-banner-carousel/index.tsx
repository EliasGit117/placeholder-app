import { type FC, type ComponentProps, useEffect, useRef, useState } from 'react';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
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
import type { TBannerPublicDto } from '@/features/banners/dtos/banner-public.ts';


interface IProps extends ComponentProps<'section'> {
}

// Desktop banners are 3:1; the optional mobile image is 6:5 and only shown
// below the md breakpoint, where the container also switches aspect ratio.
const bannerBaseClassName = 'w-full max-h-svh object-cover';
const desktopAspect = 'aspect-[3/1]';
const responsiveAspect = 'aspect-[6/5] md:aspect-[3/1]';
const baseClassName = 'container mx-auto sm:p-4';

const BannerImage: FC<{ banner: TBannerPublicDto }> = ({ banner }) => {
  const mobile = banner.mobileImage;
  const placeholder = thumbhashToDataUrl(banner.image?.thumbhash);

  return (
    <a href={banner.href ?? '#'} className="block">
      <picture>
        {mobile?.url && (
          <source media="(max-width: 767px)" srcSet={mobile.url}/>
        )}
        <img
          src={banner.image?.url}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn(bannerBaseClassName, mobile ? responsiveAspect : desktopAspect, 'bg-cover bg-center')}
          style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
        />
      </picture>
    </a>
  );
};

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
        <Skeleton className={cn(bannerBaseClassName, responsiveAspect)}/>
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
        className="group"
      >
        <CarouselContent className="ml-0">
          {banners.map((banner) => (
            <CarouselItem key={banner.id} className="pl-0">
              <BannerImage banner={banner}/>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="mt-3 flex items-center justify-center gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === selected}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              'size-2 rounded-full transition-colors',
              index === selected ? 'bg-primary' : 'bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </section>
  );
};
