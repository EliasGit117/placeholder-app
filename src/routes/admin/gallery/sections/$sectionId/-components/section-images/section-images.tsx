import { Skeleton } from '@/components/ui/skeleton';
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
        <p className="text-sm text-muted-foreground">{m['pages.gallery_sections.detail.no_images']()}</p>
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
