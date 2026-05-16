import type { ItemInstance } from '@headless-tree/core';
import { Slot } from 'radix-ui';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { IconChevronDown } from '@tabler/icons-react';

interface TreeContextValue<T = unknown> {
  indent: number;
  currentItem?: ItemInstance<T>;
  tree?: unknown;
}

const TreeContext = React.createContext<TreeContextValue>({ currentItem: undefined, indent: 20, tree: undefined });

function useTreeContext<T = unknown>() {
  return React.useContext(TreeContext) as TreeContextValue<T>;
}

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
  indent?: number;
  tree?: unknown;
}

function Tree({ indent = 20, tree, className, ...props }: TreeProps) {
  'use no memo';

  const containerProps = tree && typeof (tree as { getContainerProps?: () => object }).getContainerProps === 'function'
    ? (tree as { getContainerProps: () => object }).getContainerProps()
    : {};

  const { style: propStyle, ...otherProps } = { ...props, ...containerProps } as React.HTMLAttributes<HTMLDivElement>;

  return (
    <TreeContext.Provider value={{ indent, tree }}>
      <div
        className={cn('flex flex-col', className)}
        data-slot="tree"
        style={{ ...propStyle, '--tree-indent': `${indent}px` } as React.CSSProperties}
        {...otherProps}
      />
    </TreeContext.Provider>
  );
}

interface TreeItemProps<T = unknown> extends React.HTMLAttributes<HTMLButtonElement> {
  item: ItemInstance<T>;
  asChild?: boolean;
}

function TreeItem<T = unknown>({ item, className, asChild, children, ...props }: TreeItemProps<T>) {
  'use no memo';

  const { indent } = useTreeContext<T>();
  const itemProps = typeof item.getProps === 'function' ? item.getProps() : {};
  const { style: propStyle, ...otherProps } = { ...props, ...itemProps } as React.HTMLAttributes<HTMLButtonElement>;

  const Comp = asChild ? Slot.Root : 'button';

  return (
    <TreeContext.Provider value={{ currentItem: item as ItemInstance<unknown>, indent }}>
      <Comp
        aria-expanded={item.isExpanded()}
        className={cn(
          'z-10 select-none ps-(--tree-padding) not-last:pb-0.5 outline-hidden focus:z-20 data-disabled:pointer-events-none data-disabled:opacity-50',
          className,
        )}
        data-focus={typeof item.isFocused === 'function' ? item.isFocused() || false : undefined}
        data-folder={typeof item.isFolder === 'function' ? item.isFolder() || false : undefined}
        data-search-match={typeof item.isMatchingSearch === 'function' ? item.isMatchingSearch() || false : undefined}
        data-selected={typeof item.isSelected === 'function' ? item.isSelected() || false : undefined}
        data-slot="tree-item"
        style={{ ...propStyle, '--tree-padding': `${item.getItemMeta().level * indent}px` } as React.CSSProperties}
        {...(otherProps as object)}
      >
        {children}
      </Comp>
    </TreeContext.Provider>
  );
}

interface TreeItemLabelProps<T = unknown> extends React.HTMLAttributes<HTMLSpanElement> {
  item?: ItemInstance<T>;
}

function TreeItemLabel<T = unknown>({ item: propItem, children, className, ...props }: TreeItemLabelProps<T>) {
  'use no memo';

  const { currentItem } = useTreeContext<T>();
  const item = propItem || currentItem;

  if (!item) return null;

  return (
    <span
      className={cn(
        "flex items-center gap-1 rounded-sm bg-background in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-400/20! in-data-[selected=true]:bg-accent px-2 py-1.5 not-in-data-[folder=true]:ps-7 in-data-[selected=true]:text-accent-foreground text-sm in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 transition-colors hover:bg-accent [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      data-slot="tree-item-label"
      {...props}
    >
      {item.isFolder() && (
        <IconChevronDown className="in-aria-[expanded=false]:-rotate-90 size-4 text-muted-foreground" />
      )}
      {children ?? (typeof item.getItemName === 'function' ? item.getItemName() : null)}
    </span>
  );
}

export { Tree, TreeItem, TreeItemLabel };
