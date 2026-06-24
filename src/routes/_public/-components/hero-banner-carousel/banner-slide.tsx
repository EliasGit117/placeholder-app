import type { FC } from 'react';
import { CarouselItem } from '@/components/ui/carousel';
import type { TBannerPublicWithImagesDto } from '@/features/banners/dtos/banner-with-images.ts';

interface Props {
  item: TBannerPublicWithImagesDto;
  index: number;
}

export const BannerSlide: FC<Props> = ({ item, index }) => {
  const { banner, images } = item;
  const isFirst = index === 0;

  const compactImg = images.compact ?? images.wide;
  const wideImg = images.wide ?? images.compact;

  const href = banner.href
    ? (banner.href.startsWith('/') ? banner.href : `/${banner.href}`)
    : null;

  return (
    <CarouselItem className="pl-0">
      <div className="relative w-full h-svh min-h-svh overflow-hidden bg-muted">
        {href && (
          <a href={href} className="absolute inset-0 z-10"/>
        )}

        {compactImg && (
          <img
            src={compactImg.url}
            alt=""
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'low'}
            decoding={isFirst ? 'sync' : 'async'}
            width={compactImg.width ?? undefined}
            height={compactImg.height ?? undefined}
            className="block sm:hidden absolute inset-0 w-full h-full object-cover brightness-90"
          />
        )}
        {wideImg && (
          <img
            src={wideImg.url}
            alt=""
            loading={isFirst ? 'eager' : 'lazy'}
            fetchPriority={isFirst ? 'high' : 'low'}
            decoding={isFirst ? 'sync' : 'async'}
            width={wideImg.width ?? undefined}
            height={wideImg.height ?? undefined}
            className="hidden sm:block absolute inset-0 w-full h-full object-cover brightness-90"
          />
        )}
      </div>
    </CarouselItem>
  );
};
