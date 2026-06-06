import type { FC } from 'react';
import { thumbhashToDataUrl } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconTrash } from '@tabler/icons-react';
import type { TProductVariantImageDto } from '@/features/products/dtos/product-variant-image.ts';

export const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4';

interface IProps {
  image: TProductVariantImageDto;
  onDelete?: () => void;
}

export const ImageCard: FC<IProps> = ({ image, onDelete }) => {
  const small = image.variants.thumb256?.url ?? image.url;
  const large = image.variants.thumb512?.url ?? small;
  const placeholder = thumbhashToDataUrl(image.thumbhash);

  return (
    <div
      className="group relative aspect-square overflow-hidden rounded-lg border bg-muted bg-cover bg-center"
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
    >
      <picture className="block h-full w-full">
        <source media="(min-width: 640px)" srcSet={large}/>
        <img src={small} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"/>
      </picture>

      {onDelete && (
        <Button
          type="button"
          size="icon-xs"
          variant="destructive"
          className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100"
          // Stop the press from starting a drag on the sortable handle.
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
        >
          <IconTrash/>
        </Button>
      )}
    </div>
  );
};
