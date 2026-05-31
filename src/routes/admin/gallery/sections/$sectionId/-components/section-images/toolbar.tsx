import { IconArrowsSort, IconTrash, IconUpload } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge.tsx';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { m } from '@/paraglide/messages';
import { UploadImagesSheetTrigger } from '../upload-images';
import { useImageSelection } from '../image-selection';
import { useImageReorder } from '../image-reorder';


interface IProps {
  sectionId: number;
  imageCount: number;
  canUpdate: boolean;
  canDelete: boolean;
}

export function SectionImagesToolbar(props: IProps) {
  const { sectionId, imageCount, canUpdate, canDelete } = props;
  const { start } = useImageSelection();
  const { start: startReorder } = useImageReorder();

  if (!canUpdate && !canDelete)
    return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant='outline' className='hidden sm:flex'>
        {imageCount} {m['pages.gallery_sections.detail.image_count']()}
      </Badge>

      <div className='flex-1'/>

      {canDelete && imageCount > 0 && (
        <AdaptiveButton
          variant="ghost"
          size="sm"
          icon={IconTrash}
          text={m['pages.gallery_sections.detail.delete.trigger']()}
          onClick={start}
        />
      )}

      {canUpdate && imageCount > 1 && (
        <AdaptiveButton
          variant="ghost"
          size="sm"
          icon={IconArrowsSort}
          text={m['pages.gallery_sections.detail.reorder.trigger']()}
          onClick={startReorder}
        />
      )}

      {canUpdate && (
        <UploadImagesSheetTrigger options={{ sectionId }}>
          <AdaptiveButton
            variant="ghost"
            size="sm"
            icon={IconUpload}
            text={m['pages.gallery_sections.detail.upload_sheet.trigger']()}
          />
        </UploadImagesSheetTrigger>
      )}
    </div>
  );
}
