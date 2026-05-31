import { IconTrash, IconX } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { m } from '@/paraglide/messages';
import { useImageSelection } from './provider';


export function SelectionToolbar() {
  const { selectedIds, isDeleting, cancel, confirmDelete } = useImageSelection();

  return (
    <div className="flex items-center gap-2">
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
    </div>
  );
}
