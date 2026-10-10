import type { CSSProperties, FC, ReactNode } from 'react';
import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

interface IProps {
  selected?: boolean;
  muted?: boolean;
  onClick: () => void;
  style?: CSSProperties;
  children: ReactNode;
}

export const FilterDropdownItem: FC<IProps> = ({ selected, muted, onClick, style, children }) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    onClick={onClick}
    style={style}
    className={cn(
      'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm text-left cursor-default',
      'hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:bg-accent',
      selected && 'bg-accent/50',
      muted && 'text-muted-foreground',
    )}
  >
    <span className="truncate">{children}</span>
    {selected && <IconCheck className="size-3.5 shrink-0 ml-auto"/>}
  </button>
);
