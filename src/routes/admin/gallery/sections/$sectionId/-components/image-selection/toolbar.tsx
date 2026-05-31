import { IconTrash, IconX } from '@tabler/icons-react';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
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

      <AdaptiveButton
        variant="ghost"
        size="sm"
        icon={IconX}
        text={m['common.cancel']()}
        disabled={isDeleting}
        onClick={cancel}
      />

      <AdaptiveButton
        variant="destructive"
        size="sm"
        icon={IconTrash}
        text={m['common.delete']()}
        disabled={isDeleting || selectedIds.length === 0}
        onClick={confirmDelete}
      />
    </div>
  );
}
