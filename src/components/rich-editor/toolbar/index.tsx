import { Separator } from '@/components/ui/separator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MarkControls } from './mark-controls.tsx';
import { BlockControls } from './block-controls.tsx';
import { AlignControls } from './align-controls.tsx';
import { BlockTypeDropdown } from './block-type-dropdown.tsx';
import { HistoryControls } from './history-controls.tsx';

export function RichEditorToolbar() {
  return (
    <TooltipProvider delayDuration={300} skipDelayDuration={0}>
      {/* min-h reserves the row height so the bar doesn't jump when the editor
          (and thus the controls) mounts client-side. */}
      <div className="flex min-h-12 flex-wrap items-center gap-1 border-b bg-card p-2">
        <HistoryControls/>
        <Separator orientation="vertical" className="mx-1 my-auto h-6"/>
        <BlockTypeDropdown/>
        <BlockControls/>
        <Separator orientation="vertical" className="mx-1 my-auto h-6"/>
        <AlignControls/>
        <Separator orientation="vertical" className="mx-1 my-auto h-6"/>
        <MarkControls/>
      </div>
    </TooltipProvider>
  );
}
