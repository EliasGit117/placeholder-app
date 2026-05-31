import { IconTrash } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge.tsx';
import { m } from '@/paraglide/messages';
import { UploadImagesSheetTrigger } from '../upload-images';
import { useImageSelection } from '../image-selection';
import type { TGallerySectionImageDto } from '@/features/gallery-sections/dtos/gallery-section-image.ts';


interface IProps {
  sectionId: number;
  images: TGallerySectionImageDto[];
  canUpdate: boolean;
  canDelete: boolean;
}

export function SectionImagesToolbar(props: IProps) {
  const { sectionId, images, canUpdate, canDelete } = props;
  const { start } = useImageSelection();

  if (!canUpdate && !canDelete)
    return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant='outline'>
        {images.length} {m['pages.gallery_sections.detail.image_count']()}
      </Badge>

      <div className='flex-1'/>

      {canDelete && images.length > 0 && (
        <Button variant="ghost" size="sm" onClick={start}>
          <IconTrash/>
          <span>{m['pages.gallery_sections.detail.delete.trigger']()}</span>
        </Button>
      )}
      {canUpdate && (
        <UploadImagesSheetTrigger options={{ sectionId }} size="sm" variant="ghost"/>
      )}
    </div>
  );
}
