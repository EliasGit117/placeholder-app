import { type FC, type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';


interface IProps extends ComponentProps<'section'> {
}

const bannerBaseClassName = 'aspect-video w-full max-h-svh';

export const HeroBannerCarousel: FC<IProps> = ({ className, ...props }) => {
  const { data: banners, isPending } = useQuery({
    ...orpc.banners.getValid.queryOptions(),
    placeholderData: keepPreviousData
  });

  const firstBanner = (banners && banners.length > 0) ? banners?.[0] : null;

  return (
    <section className={cn('flex flex-col gap-4 container mx-auto py-4 sm:px-4', className)} {...props}>
      {!isPending ? (
        <a href={firstBanner?.href ?? '#'}>
          <img src={firstBanner?.image?.url} alt="" className={cn(bannerBaseClassName)} />
        </a>
      ) : (
        <Skeleton className={cn(bannerBaseClassName)}>

        </Skeleton>
      )}
    </section>
  );
};
