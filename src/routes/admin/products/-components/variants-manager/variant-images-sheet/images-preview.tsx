import type { FC } from 'react';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { IconPhoto } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';
import type { TProductVariantImageDto } from '@/features/products/dtos/product-variant-image.ts';
import { GRID_CLASS, ImageCard } from './image-card.tsx';

interface IProps {
  images: TProductVariantImageDto[];
  isPending: boolean;
  disabled?: boolean;
  onDelete: (id: number) => void;
}

export const ImagesPreview: FC<IProps> = ({ images, isPending, disabled, onDelete }) => {
  if (isPending)
    return (
      <div className={GRID_CLASS}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg"/>
        ))}
      </div>
    );

  if (images.length === 0)
    return (
      <Empty className="mt-8">
        <EmptyHeader>
          <EmptyMedia variant="icon"><IconPhoto/></EmptyMedia>
          <EmptyTitle className="text-muted-foreground">
            {m['pages.products.variants.images.empty']()}
          </EmptyTitle>
        </EmptyHeader>
      </Empty>
    );

  return (
    <div className={cn(GRID_CLASS, 'transition-opacity', disabled && 'pointer-events-none opacity-60')}>
      {images.map((img) => (
        <ImageCard key={img.id} image={img} onDelete={() => onDelete(img.id)}/>
      ))}
    </div>
  );
};
