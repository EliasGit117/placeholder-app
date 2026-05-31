import type { FC } from 'react';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import type { TGallerySectionImageDto } from '@/features/gallery-sections/dtos/gallery-section-image.ts';
import { useImageSelection } from '../image-selection';

interface IProps {
  image: TGallerySectionImageDto;
  disabled?: boolean;
}

export const ImageCard: FC<IProps> = ({ image, disabled }) => {
  const { selecting, selectedSet, toggle } = useImageSelection();

  // Fall back to the original when a thumbnail is missing.
  const small = image.variants.thumb256?.url ?? image.url;
  const large = image.variants.thumb512?.url ?? small;
  const placeholder = thumbhashToDataUrl(image.thumbhash);
  const selected = selectedSet.has(image.id);

  return (
    <div
      className={cn(
        'relative aspect-square overflow-hidden rounded-lg border bg-muted bg-cover bg-center',
        selecting && selected && 'ring ring-foreground ring-offset-4 ring-offset-background',
        selecting && !disabled && 'cursor-pointer',
        disabled && 'pointer-events-none opacity-75',
      )}
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
      onClick={selecting && !disabled ? () => toggle(image.id) : undefined}
    >
      <picture className="block h-full w-full">
        {/* 256 on mobile, 512 from the sm breakpoint (640px) up */}
        <source media="(min-width: 640px)" srcSet={large}/>
        <img
          src={small}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>

      {selecting && (
        <Checkbox
          checked={selected}
          className="pointer-events-none absolute right-1.5 top-1.5 bg-background/80"
        />
      )}
    </div>
  );
};
