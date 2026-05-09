import { type Column } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type HTMLAttributes } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconChevronDown, IconSelector, IconChevronUp, IconPoint, IconEraser, IconEyeOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


interface DataTableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title?: string;
  iconHidden?: boolean;
}

export function DataTableColumnHeader<TData, TValue>(props: DataTableColumnHeaderProps<TData, TValue>) {
  'use no memo';

  const { column, title: customTitle, className, iconHidden } = props;
  const isSorted = column.getIsSorted();
  const title = customTitle ?? column.columnDef.meta?.label ?? column.id;
  const Icon = !iconHidden ? column.columnDef.meta?.icon : undefined;

  if (!column.getCanSort()) {
    return (
      <div className={cn(className, 'flex items-center gap-2')}>
        {Icon && <Icon className="size-4 text-muted-foreground"/>}
        <span>{title}</span>
      </div>
    );
  }

  const toggleSorting = (value: boolean) => column.toggleSorting(value);
  const clearSorting = () => column.clearSorting();
  const hide = () => column.toggleVisibility(false);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="data-[state=open]:bg-accent h-fit px-1.5 -ml-1.5 py-1 flex items-center gap-2"
          >
            {Icon && <Icon className="text-muted-foreground"/>}
            <span>{title}</span>

            {isSorted === 'desc' ? (
              <IconChevronDown className=" text-muted-foreground"/>
            ) : isSorted === 'asc' ? (
              <IconChevronUp className=" text-muted-foreground"/>
            ) : (
              <IconSelector className=" text-muted-foreground"/>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-fit min-w-42" align="start">
          <DropdownMenuItem onClick={() => toggleSorting(false)}>
            <IconChevronUp/>
            <span>{m['common.asc']()}</span>
            {isSorted === 'asc' && (<IconPoint className="ml-auto stroke-5"/>)}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => toggleSorting(true)}>
            <IconChevronDown/>
            <span>{m['common.desc']()}</span>
            {isSorted === 'desc' && (<IconPoint className="ml-auto stroke-5"/>)}
          </DropdownMenuItem>

          {isSorted && (
            <DropdownMenuItem onClick={clearSorting}>
              <IconEraser/>
              <span>{m['components.data_table.clear']()}</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator/>

          <DropdownMenuItem onClick={hide}>
            <IconEyeOff/>
            <span>{m['components.data_table.hide']()}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
