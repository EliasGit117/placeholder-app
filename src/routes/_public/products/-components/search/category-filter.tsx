import { type CSSProperties, type FC, type ReactNode, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { orpc } from '@/lib/orpc';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { IconCheck, IconChevronDown, IconFilter } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import type { ICategoryNodeDto } from '@/features/categories/public/dtos/category-tree.ts';

export const CategoryFilter: FC = () => {
  const navigate = useNavigate({ from: '/products/' });
  const categoryId = useSearch({ from: '/_public/products/', select: (search) => search.categoryId });

  const { data: tree, isPending } = useQuery(orpc.categories.getTree.queryOptions({ input: { depth: 5 } }));
  const forest = tree ?? [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const flatItems = flattenForest(forest);

  const query = search.trim().toLowerCase();
  const filtered = query ? flattenForest(forest, 0, query) : flatItems;

  const allLabel = m['components.shop.filters.category_all']();
  const showAll = !query || allLabel.toLowerCase().includes(query);

  const selectedNode = categoryId != null ? flatItems.find(({ node }) => node.id === categoryId)?.node : undefined;

  const commit = useDebouncedCallback((id: number | null) => {
    void navigate({
      search: (prev) => ({ ...prev, categoryId: id ?? undefined, page: 1 }),
      replace: true,
    });
  }, 400);

  const select = (id: number | null) => {
    commit(id);
    setOpen(false);
    setSearch('');
  };

  if (!isPending && forest.length === 0) return null;

  return (
    <div className="space-y-3">
      <Label>{m['components.shop.filters.category_label']()}</Label>

      {/* modal: popover is portaled out of the mobile filter Sheet, whose scroll lock would otherwise block touch scroll in the list */}
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }} modal>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
            className={cn('w-full justify-between font-normal', !selectedNode && 'text-muted-foreground')}
          >
            {isPending ? (
              <Skeleton className="h-4 w-32"/>
            ) : (
              <span className="truncate">{selectedNode ? selectedNode.name : allLabel}</span>
            )}
            <IconChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground"/>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="p-0 w-(--radix-popover-trigger-width) min-w-56 gap-0"
        >
          <div className="p-1">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <IconFilter className="size-3.5 text-muted-foreground"/>
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

          <div className="max-h-64 overflow-y-auto p-1">
            {showAll && (
              <DropdownItem style={{ paddingLeft: 8 }} selected={categoryId == null} onClick={() => select(null)}>
                {allLabel}
              </DropdownItem>
            )}

            {!showAll && filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {m['common.no_results']()}
              </p>
            ) : (
              filtered.map(({ node, level, matched }) => (
                <DropdownItem
                  key={node.id}
                  selected={node.id === categoryId}
                  muted={!matched}
                  onClick={() => select(node.id)}
                  style={{ paddingLeft: level * 16 + 8 }}
                >
                  {node.name}
                </DropdownItem>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

interface IDropdownItemProps {
  selected?: boolean;
  muted?: boolean;
  onClick: () => void;
  style?: CSSProperties;
  children: ReactNode;
}

const DropdownItem: FC<IDropdownItemProps> = ({ selected, muted, onClick, style, children }) => (
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

interface IFlatItem {
  node: ICategoryNodeDto;
  level: number;
  /** false for ancestors kept only to preserve the tree path to a match */
  matched: boolean;
}

/** Flattens the forest depth-first. With `query`, keeps matching nodes plus their ancestors. */
function flattenForest(nodes: ICategoryNodeDto[], level = 0, query?: string): IFlatItem[] {
  const result: IFlatItem[] = [];
  for (const node of nodes) {
    const children = flattenForest(node.children, level + 1, query);
    const matched = !query || node.name.toLowerCase().includes(query);
    if (matched || children.length) {
      result.push({ node, level, matched }, ...children);
    }
  }
  return result;
}
