import { IconTrash, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { m } from '@/paraglide/messages';
import { UploadImagesSheetTrigger } from '../upload-images';
import { useSectionImages } from './provider';
import { Badge } from '@/components/ui/badge.tsx';


export function SectionImagesToolbar() {
  const {
    sectionId,
    canUpdate,
    canDelete,
    images,
    selecting,
    selectedIds,
    isDeleting,
    start,
    cancel,
    confirmDelete,
  } = useSectionImages();

  if (!canUpdate && !canDelete)
    return null;

  return (
    <div className="flex items-center gap-2">
      {selecting ? (
        <>
          <span className="mr-auto text-sm text-muted-foreground">
            {selectedIds.length} {m['common.selected']()}
          </span>

          <div className='flex-1'/>

          <Button variant="ghost" size="sm" onClick={cancel} disabled={isDeleting}>
            <IconX/>
            <span>{m['common.cancel']()}</span>
          </Button>
          <LoadingButton
            variant="destructive"
            size="sm"
            loading={isDeleting}
            disabled={selectedIds.length === 0}
            onClick={confirmDelete}
          >
            <IconTrash/>
            <span>{m['common.delete']()}</span>
          </LoadingButton>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
