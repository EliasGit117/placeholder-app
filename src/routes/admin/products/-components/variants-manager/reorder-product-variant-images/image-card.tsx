import type { FC } from 'react';
import { thumbhashToDataUrl } from '@/lib/utils';
import type { TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';

export const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4';

interface IProps {
  image: TProductVariantImageDto;
}

export const ImageCard: FC<IProps> = ({ image }) => {
  const small = image.variants.thumb256?.url ?? image.url;
  const large = image.variants.thumb512?.url ?? small;
  const placeholder = thumbhashToDataUrl(image.thumbhash);

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-lg border bg-muted bg-cover bg-center"
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
    >
      <picture className="block h-full w-full">
        <source media="(min-width: 640px)" srcSet={large}/>
        <img src={small} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"/>
      </picture>
    </div>
  );
};
