import { IconCheck, IconX } from '@tabler/icons-react';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { m } from '@/paraglide/messages';
import { useImageReorder } from './provider';


export function ReorderToolbar() {
  const { isSaving, cancel, save } = useImageReorder();

  return (
    <div className="flex items-center gap-2">
      <span className="mr-auto text-sm text-muted-foreground hidden md:block">
        {m['pages.gallery_sections.detail.reorder.hint']()}
      </span>

      <div className="flex-1"/>

      <AdaptiveButton
        variant="ghost"
        size="sm"
        icon={IconX}
        text={m['common.cancel']()}
        disabled={isSaving}
        onClick={cancel}
      />

      <AdaptiveButton
        variant="ghost"
        size="sm"
        icon={IconCheck}
        text={m['common.save']()}
        disabled={isSaving}
        onClick={save}
      />
    </div>
  );
}
