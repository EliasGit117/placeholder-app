import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconPhoto } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { SelectionToolbar, useImageSelection } from '../image-selection';
import { ReorderToolbar, useImageReorder } from '../image-reorder';
import { SectionImagesToolbar } from './toolbar';
import { SortableImages } from './sortable-images';
import { ImageCard } from './image-card';


interface IProps {
  sectionId: number;
  canUpdate: boolean;
  canDelete: boolean;
}

export function SectionImages(props: IProps) {
  const { sectionId, canUpdate, canDelete } = props;
  const { selecting, isDeleting } = useImageSelection();
  const { reordering } = useImageReorder();

  const { data: images = [], isPending } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({
      input: { sectionId },
    })
  );

  return (
    <div className="space-y-4">
      {selecting ? (
        <SelectionToolbar/>
      ) : reordering ? (
        <ReorderToolbar/>
      ) : (
        <SectionImagesToolbar
          imageCount={images.length}
          sectionId={sectionId}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      )}

      {reordering ? (
        <SortableImages/>
      ) : isPending ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {images.map((img) => (
            <ImageCard key={img.id} image={img} disabled={isDeleting}/>
          ))}
        </div>
      )}
    </div>
  );
}
