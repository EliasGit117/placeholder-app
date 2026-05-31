import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconPhoto } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { useSectionImages } from './provider';
import { SectionImagesToolbar } from './toolbar';
import { ImageCard } from './image-card';


export function SectionImages() {
  const { images, isPending } = useSectionImages();

  return (
    <div className="space-y-4">
      <SectionImagesToolbar/>

      {isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg"/>
          ))}
        </div>
      ) : images.length === 0 ? (
        <Empty className='mt-16'>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconPhoto/>
            </EmptyMedia>
            <EmptyTitle className='text-muted-foreground'>
              {m['pages.gallery_sections.detail.no_images']()}
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img) => (
            <ImageCard key={img.id} image={img}/>
          ))}
        </div>
      )}
    </div>
  );
}
