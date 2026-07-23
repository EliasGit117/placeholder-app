import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button.tsx';
import {
  IconFolderMinus,
  IconFolderPlus,
  IconFilter,
  IconInfoCircle,
  IconPencil,
  IconTrash,
  IconX, IconFilePlus,
  IconCategory
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useCategoryTree } from './provider.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu.tsx';
import { useCategorySheetActions, CategorySheetMode } from '../category-sheet/index.ts';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from '@/components/ui/input-group.tsx';
import { Tree, TreeItem, TreeItemLabel } from '@/components/ui/tree.tsx';
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty.tsx';
import type { ItemInstance } from '@headless-tree/core';
import type { ICategoryTreeNodeDto } from '@/features/categories/admin/dtos/category-tree.ts';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { m } from '@/paraglide/messages';
import { Route } from '@/routes/admin/categories/index.tsx';


export const CategoryTree: FC<{ className?: string }> = ({ className }) => {
  'use no memo';

  const { open: openSheet } = useCategorySheetActions();
  const { tree, disabled, deleteCategory, isPending, indent, isEmpty, filteredIds } = useCategoryTree();
  const confirm = useConfirm();
  const { canCreate, canUpdate, canDelete } = Route.useRouteContext();

  const isItemVisible = (item: ItemInstance<ICategoryTreeNodeDto>): boolean => {
    if (!filteredIds) return true;
    return filteredIds.has(item.getId());
  };

  const deleteWithConfirm = async (id: number) => {
    const isConfirmed = await confirm({
      title: m['pages.categories.index.tree.delete_title'](),
      description: m['pages.categories.index.tree.delete_description'](),
      confirmText: m['common.delete'](),
      cancelText: m['common.close'](),
      confirmButton: { variant: 'destructive' },
    });

    if (!isConfirmed) return;

    toast.promise(deleteCategory(id), {
      loading: m['pages.categories.index.tree.deleting'](),
      success: () => m['pages.categories.index.tree.delete_success'](),
      error: (err: Error) => err?.message ?? m['pages.categories.index.tree.delete_error'](),
    });
  };

  if (isPending)
    return (
      <div className={cn('space-y-2', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-full"/>
        ))}
      </div>
    );

  if (isEmpty)
    return (
      <Empty className={cn('-mt-12', className)}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconCategory/>
          </EmptyMedia>
          <EmptyTitle>{m['pages.categories.index.tree.no_categories']()}</EmptyTitle>
        </EmptyHeader>
        {canCreate && (
          <EmptyContent>
            <Button variant="outline" onClick={() => openSheet({ mode: CategorySheetMode.Create })}>
              <IconFilePlus/>
              {m['common.create']()}
            </Button>
          </EmptyContent>
        )}
      </Empty>
    );

  return (
    <Tree
      tree={tree}
      indent={indent}
      className={cn(disabled && 'opacity-50 pointer-events-none', className)}
      aria-label="Categories"
    >
      {tree.getItems().map((item) => {
        const data = item.getItemData();

        return (
          <ContextMenu key={item.getId()}>
            <ContextMenuTrigger asChild>
              <div
                className="flex items-center not-last:pb-0.5 data-[visible=false]:hidden"
                data-visible={isItemVisible(item)}
              >
                <TreeItem className="flex-1 not-last:pb-0" item={item}>
                  <TreeItemLabel className="before:-inset-y-0.5 before:-z-10 relative before:absolute before:inset-x-0 before:bg-background">
                    <div className="flex items-center gap-2 w-full">
                      <span>{item.getItemName()}</span>
                      {item.isFolder() && (
                        <span className="-ms-1 text-xs text-muted-foreground">
                          ({item.getChildren().length})
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto font-mono">{data.slug}</span>
                    </div>
                  </TreeItemLabel>
                </TreeItem>
              </div>
            </ContextMenuTrigger>

            <ContextMenuContent className="min-w-56">
              <ContextMenuLabel className="truncate max-w-48">{item.getItemName()}</ContextMenuLabel>
              <ContextMenuSeparator/>

              <ContextMenuGroup>
                {canUpdate && (
                  <ContextMenuItem onClick={() => setTimeout(() => openSheet({ mode: CategorySheetMode.Update, categoryId: Number(item.getId()) }), 0)}>
                    <IconPencil className="text-muted-foreground size-4"/>
                    <span>{m['common.edit']()}</span>
                  </ContextMenuItem>
                )}

                {canCreate && (
                  <ContextMenuItem onClick={() => setTimeout(() => openSheet({ mode: CategorySheetMode.Create, parentId: Number(item.getId()) }), 0)}>
                    <IconFilePlus className="text-muted-foreground size-4"/>
                    <span>{m['pages.categories.index.tree.add_child']()}</span>
                  </ContextMenuItem>
                )}

                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <IconInfoCircle className="text-muted-foreground size-4"/>
                    <span>{m['pages.categories.index.tree.short_info']()}</span>
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent className="p-2 min-w-48">
                    <div className="text-xs whitespace-pre-wrap rounded-md bg-muted p-3 overflow-auto max-h-80 font-mono">
                      {JSON.stringify({ ...data, children: undefined }, null, 2)}
                    </div>
                  </ContextMenuSubContent>
                </ContextMenuSub>

                {canDelete && (
                  <>
                    <ContextMenuSeparator/>
                    <ContextMenuItem
                      variant="destructive"
                      disabled={disabled}
                      onClick={() => setTimeout(() => deleteWithConfirm(Number(item.getId())), 0)}
                    >
                      <IconTrash className="size-4"/>
                      <span>{m['common.delete']()}</span>
                    </ContextMenuItem>
                  </>
                )}
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </Tree>
  );
};


export const CategoryTreeToolbar: FC<ComponentProps<'div'>> = ({ className, children, ...divProps }) => {
  const { tree, disabled, searchValue, setSearchValue } = useCategoryTree();

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn('flex items-center gap-2', className)}
      {...divProps}
    >
      <ButtonGroup>
        <Button size="sm" variant="outline" onClick={() => tree.collapseAll()} disabled={disabled}>
          <IconFolderMinus/>
          <span className="sr-only lg:not-sr-only">{m['common.collapse']()}</span>
        </Button>
        <Button size="sm" variant="outline" onClick={() => tree.expandAll()} disabled={disabled}>
          <IconFolderPlus/>
          <span className="sr-only lg:not-sr-only">{m['common.expand']()}</span>
        </Button>
      </ButtonGroup>

      <InputGroup className="max-w-64 h-7">
        <InputGroupAddon align="inline-start">
          <InputGroupText>
            <IconFilter/>
          </InputGroupText>
        </InputGroupAddon>
        <InputGroupInput
          placeholder={`${m['common.select']()}...`}
          value={searchValue}
          onChange={e => {
            setSearchValue(e.target.value);
            const searchProps = tree.getSearchInputElementProps();
            searchProps.onChange?.(e);
            if (e.target.value.trim()) tree.expandAll();
          }}
          disabled={disabled}
        />
        {searchValue && (
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              onClick={() => {
                setSearchValue('');
                const searchProps = tree.getSearchInputElementProps();
                searchProps.onChange?.({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <IconX className="size-3.5"/>
            </InputGroupButton>
          </InputGroupAddon>
        )}
      </InputGroup>

      {children}
    </div>
  );
};
