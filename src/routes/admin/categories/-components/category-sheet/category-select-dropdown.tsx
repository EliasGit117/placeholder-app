import { type ComponentProps, type CSSProperties, type FC, type ReactNode, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group.tsx';
import { IconCheck, IconChevronDown, IconFilter } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import type { TCategoryTreeNode } from '@/features/categories/schemas/category.ts';

const locale = getLocale();

const getLocaleName = (node: TCategoryTreeNode): string =>
  locale === 'ru' ? node.nameRu : node.nameRo;

interface IProps extends Omit<ComponentProps<typeof Button>, 'value' | 'onChange'> {
  value?: number | null;
  onValueChange?: (value: number | null) => void;
  forest?: TCategoryTreeNode[];
  /** Exclude this id and all its descendants from the list (used to prevent self-parenting). */
  excludeId?: number;
  placeholder?: string;
}

export const CategorySelectDropdown: FC<IProps> = ({
  value,
  onValueChange,
  forest = [],
  excludeId,
  placeholder,
  className,
  disabled,
  ...btnProps
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Flatten the forest into { node, level } pairs, excluding excludeId subtree.
  const flatItems = flattenForest(forest, excludeId);

  const filtered = search.trim()
    ? flatItems.filter(({ node }) =>
        getLocaleName(node).toLowerCase().includes(search.toLowerCase())
      )
    : flatItems;

  const selectedNode = value ? flatItems.find(({ node }) => node.id === value)?.node : undefined;

  const select = (id: number | null) => {
    onValueChange?.(id);
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !selectedNode && 'text-muted-foreground',
            className,
          )}
          {...btnProps}
        >
          <span className="truncate">
            {selectedNode ? getLocaleName(selectedNode) : (placeholder ?? m['pages.categories.index.sheet.no_parent']())}
          </span>
          <IconChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={4}
        className="p-0 w-(--radix-popover-trigger-width) min-w-56 gap-0"
      >
        {/* Search */}
        <div className="p-1">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>
                <IconFilter className="size-3.5 text-muted-foreground" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              placeholder={`${m['common.select']()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </InputGroup>
        </div>

        {/* List */}
        <div className="max-h-64 overflow-y-auto p-1 pt-0">
          {/* None option */}
          <DropdownItem
            selected={!value}
            onClick={() => select(null)}
            style={{ paddingLeft: 8 }}
          >
            {m['pages.categories.index.sheet.no_parent']()}
          </DropdownItem>

          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {m['common.no_results']()}
            </p>
          ) : (
            filtered.map(({ node, level }) => (
              <DropdownItem
                key={node.id}
                selected={node.id === value}
                onClick={() => select(node.id)}
                style={{ paddingLeft: level * 16 + 8 }}
              >
                {getLocaleName(node)}
              </DropdownItem>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};


interface IDropdownItemProps {
  selected?: boolean;
  onClick: () => void;
  style?: CSSProperties;
  children: ReactNode;
}

const DropdownItem: FC<IDropdownItemProps> = ({ selected, onClick, style, children }) => (
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
    )}
  >
    <span className="truncate">{children}</span>
    {selected && <IconCheck className='size-3.5 shrink-0 ml-auto'/>}
  </button>
);


// ─── helpers ────────────────────────────────────────────────────────────────

interface FlatItem {
  node: TCategoryTreeNode;
  level: number;
}

function flattenForest(
  nodes: TCategoryTreeNode[],
  excludeId: number | undefined,
  level = 0,
): FlatItem[] {
  const result: FlatItem[] = [];
  for (const node of nodes) {
    if (node.id === excludeId) continue; // skip self and its descendants
    result.push({ node, level });
    if (node.children.length) {
      result.push(...flattenForest(node.children, excludeId, level + 1));
    }
  }
  return result;
}
