import type { FC } from 'react';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { IconPhotoOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';
import type { TProductVariantImageDto } from '@/features/products/dtos/product-variant-image.ts';
import { gridClass, ImageCard } from './image-card.tsx';


interface IProps {
  images: TProductVariantImageDto[];
  isPending: boolean;
  disabled?: boolean;
  onDelete: (id: number) => void;
}

export const ImagesPreview: FC<IProps> = ({ images, isPending, disabled, onDelete }) => {
  if (isPending)
    return (
      <div className={gridClass}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg"/>
        ))}
      </div>
    );

  if (images.length === 0)
    return (
      <Empty className="my-auto">
        <EmptyHeader>
          <EmptyMedia variant="icon"><IconPhotoOff/></EmptyMedia>
          <EmptyTitle>
            {m['pages.products.variants.images.empty']()}
          </EmptyTitle>
          <EmptyDescription>
            {m['pages.products.variants.images.empty_description']()}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );

  return (
    <div className={cn(gridClass, 'transition-opacity', disabled && 'pointer-events-none opacity-60')}>
      {images.map((img) => (
        <ImageCard key={img.id} image={img} onDelete={() => onDelete(img.id)}/>
      ))}
    </div>
  );
};
