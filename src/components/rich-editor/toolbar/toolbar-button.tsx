import type { ComponentType } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatShortcut } from './format-shortcut.ts';

interface IProps {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  shortcut?: string;
  icon: ComponentType<{ className?: string }>;
}

export function ToolbarButton({ label, onClick, active = false, disabled = false, shortcut, icon: Icon }: IProps) {
  const formattedShortcut = shortcut ? formatShortcut(shortcut) : null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={label}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
          disabled={disabled}
          className={cn(active && 'bg-muted text-foreground')}
        >
          <Icon className="size-4"/>
        </Button>
      </TooltipTrigger>

      <TooltipContent side="top" sideOffset={6}>
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {formattedShortcut && <kbd className="ml-2">{formattedShortcut}</kbd>}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
