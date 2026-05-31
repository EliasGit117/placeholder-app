import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconPhoto } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { SelectionToolbar, useImageSelection } from '../image-selection';
import { SectionImagesToolbar } from './toolbar';
import { ImageCard } from './image-card';


interface IProps {
  sectionId: number;
  canUpdate: boolean;
  canDelete: boolean;
}

export function SectionImages(props: IProps) {
  const { sectionId, canUpdate, canDelete } = props;
  const { selecting, isDeleting } = useImageSelection();

  const { data: images = [], isPending } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({
      input: { sectionId },
    })
  );

  return (
    <div className="space-y-4">
      {selecting ? (
        <SelectionToolbar/>
      ) : (
        <SectionImagesToolbar
          images={images}
          sectionId={sectionId}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      )}

      {isPending ? (
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
