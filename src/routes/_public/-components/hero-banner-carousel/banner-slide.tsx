import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CarouselItem } from '@/components/ui/carousel';
import type { TBannerPublicWithImagesDto } from '@/features/banners/dtos/banner-with-images.ts';
import { overlayXClass, overlayYClass } from './utils.ts';
import { m } from '@/paraglide/messages';
import { BannerStyle } from '~/prisma/generated/prisma/enums.ts';

interface Props {
  item: TBannerPublicWithImagesDto;
  index: number;
}

export const BannerSlide: FC<Props> = ({ item, index }) => {
  const { banner, images } = item;
  const isFirst = index === 0;

  const mobileImg = images.mobile ?? images.tablet ?? images.desktop;
  const tabletImg = images.tablet ?? images.desktop ?? images.mobile;
  const desktopImg = images.desktop ?? images.tablet ?? images.mobile;

  // Alignment and style follow whichever image is actually shown, not the viewport.
  const mobileDevice = images.mobile ? 'mobile' : images.tablet ? 'tablet' : 'desktop';
  const tabletDevice = images.tablet ? 'tablet' : images.desktop ? 'desktop' : 'mobile';
  const desktopDevice = images.desktop ? 'desktop' : images.tablet ? 'tablet' : 'mobile';

  const mobileLightEl = banner[`${mobileDevice}Style`] === BannerStyle.LIGHT;
  const tabletLightEl = banner[`${tabletDevice}Style`] === BannerStyle.LIGHT;
  const desktopLightEl = banner[`${desktopDevice}Style`] === BannerStyle.LIGHT;

  const mobileXAlign = banner[`${mobileDevice}XAlign`];
  const mobileYAlign = banner[`${mobileDevice}YAlign`];
  const tabletXAlign = banner[`${tabletDevice}XAlign`];
  const tabletYAlign = banner[`${tabletDevice}YAlign`];
  const desktopXAlign = banner[`${desktopDevice}XAlign`];
  const desktopYAlign = banner[`${desktopDevice}YAlign`];

  const hasContent = banner.title || banner.description || banner.href;

  return (
    <CarouselItem className="pl-0">
      <div className="relative w-full h-svh min-h-svh overflow-hidden bg-muted">

        {/* Images */}
        {mobileImg && (
          <img
            src={mobileImg.url}
            alt={banner.title ?? ''}
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'low'}
            decoding={isFirst ? 'sync' : 'async'}
            width={mobileImg.width ?? undefined}
            height={mobileImg.height ?? undefined}
            className="block sm:hidden absolute inset-0 w-full h-full object-cover brightness-90"
          />
        )}
        {tabletImg && (
          <img
            src={tabletImg.url}
            alt={banner.title ?? ''}
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'low'}
            decoding={isFirst ? 'sync' : 'async'}
            width={tabletImg.width ?? undefined}
            height={tabletImg.height ?? undefined}
            className="hidden sm:block lg:hidden absolute inset-0 w-full h-full object-cover brightness-90"
          />
        )}
        {desktopImg && (
          <img
            src={desktopImg.url}
            alt={banner.title ?? ''}
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'low'}
            decoding={isFirst ? 'sync' : 'async'}
            width={desktopImg.width ?? undefined}
            height={desktopImg.height ?? undefined}
            className="hidden lg:block absolute inset-0 w-full h-full object-cover brightness-90"
          />
        )}

        {hasContent && (
          <>
            {/* Text overlays */}
            <div className={cn(
              'sm:hidden absolute z-10 inset-x-0 flex flex-col px-6 gap-2',
              overlayYClass(mobileYAlign),
              overlayXClass(mobileXAlign)
            )}>
              <Overlay banner={banner} lightEl={mobileLightEl}/>
            </div>

            <div className={cn(
              'hidden sm:flex lg:hidden absolute z-10 inset-x-0 flex-col px-8 gap-2',
              overlayYClass(tabletYAlign),
              overlayXClass(tabletXAlign)
            )}>
              <Overlay banner={banner} lightEl={tabletLightEl}/>
            </div>

            <div className={cn(
              'hidden lg:flex absolute z-10 inset-x-0 flex-col container mx-auto px-4 gap-2',
              overlayYClass(desktopYAlign),
              overlayXClass(desktopXAlign)
            )}>
              <Overlay banner={banner} lightEl={desktopLightEl}/>
            </div>
          </>
        )}
      </div>
    </CarouselItem>
  );
};

interface OverlayProps {
  banner: TBannerPublicWithImagesDto['banner'];
  lightEl: boolean;
}

const Overlay: FC<OverlayProps> = ({ banner, lightEl }) => (
  <>
    {banner.title && (
      <p className={cn(
        'text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-3xl whitespace-pre-line',
        lightEl ? 'text-white' : 'text-gray-800'
      )}>
        {banner.title}
      </p>
    )}

    {banner.description && (
      <p className={cn(
        'text-base sm:text-lg max-w-xl leading-relaxed whitespace-pre-line',
        lightEl ? 'text-white/85' : 'text-gray-800/80'
      )}>
        {banner.description}
      </p>
    )}

    {banner.href && (
      <Button
        asChild
        size="lg"
        className={cn(
          'w-fit mt-2 h-9! sm:h-10! lg:h-11! px-4! sm:px-6! lg:px-8! text-xs! sm:text-sm! lg:text-base!',
          lightEl
            ? 'bg-white! text-black! hover:bg-white/90!'
            : 'bg-gray-800! text-white! hover:bg-gray-700!'
        )}
      >
        <a href={banner.href.startsWith('/') ? banner.href : `/${banner.href}`}>
          {m['pages.home.hero_banners.show_details']()}
        </a>
      </Button>
    )}
  </>
);
