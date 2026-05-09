import { useDataTableContext } from '@/components/data-table/context';
import { type ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { IconArrowsUpDown, IconChevronDown, IconChevronUp, IconPoint, IconCircleX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';



interface IDataTableSortPopoverProps<_>
  extends ComponentProps<typeof PopoverTrigger> {
}

export function DataTableSortPopover<TData>({ ...props }: IDataTableSortPopoverProps<TData>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { table } = useDataTableContext();
  const sorting = table.getState().sorting;
  const sortableColumns = table.getAllColumns().filter(col => col.getCanSort());
  const currentSort = sorting[0] || null;

  return (
    <Popover>
      <PopoverTrigger {...props} asChild>
        <Button role="combobox" variant="outline" size="sm" className='w-7 sm:w-fit'>
          <IconArrowsUpDown/>
          <span className="sr-only sm:not-sr-only">
            {m['components.data_table.sort']()}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="min-w-48 w-fit p-0 gap-1">
        <Command className="space-y-1">
          <CommandInput
            placeholder={`${m['components.data_table.search_columns']()}...`}
            wrapperClassName="p-0"
            groupClassName="rounded-sm!"
          />
          <CommandList>
            <CommandEmpty>
              {m['components.data_table.no_columns_found']()}
            </CommandEmpty>
            <CommandGroup className="p-0" heading={m['components.data_table.sort_by']()}>
              {sortableColumns.map((column) => {
                const Icon = column.columnDef.meta?.icon;

                return (
                  <CommandItem
                    key={column.id}
                    onSelect={() => table.setSorting([{ id: column.id, desc: !!currentSort?.desc }])}
                  >
                    {Icon && <Icon className="size-4 text-muted-foreground"/>}
                    <span className="truncate">
                      {column.columnDef.meta?.label ?? column.id}
                    </span>
                    {currentSort?.id === column.id && (<IconPoint className="ml-auto stroke-5"/>)}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        {!!currentSort && (
          <>
            <Separator/>

            <Command className="space-y-1">
              <CommandList>
                <CommandGroup className="p-0" heading={m['components.data_table.direction']()}>
                  <CommandItem
                    onSelect={() => table.setSorting([{ id: currentSort.id, desc: false }])}
                  >
                    <IconChevronUp className="size-4 text-muted-foreground"/>
                    <span className="truncate">
                      {m['common.asc']()}
                    </span>
                    {!currentSort.desc && <IconPoint className="ml-auto stroke-5"/>}
                  </CommandItem>

                  <CommandItem
                    onSelect={() => table.setSorting([{ id: currentSort.id, desc: true }])}
                  >
                    <IconChevronDown className="size-4 text-muted-foreground"/>
                    <span className="truncate">
                      {m['common.desc']()}
                    </span>
                    {currentSort.desc && <IconPoint className="ml-auto stroke-5"/>}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>

            <Separator/>

            <Button size="sm" variant="ghost" className="m-1 mt-0" onClick={() => table.setSorting([])}>
              <IconCircleX/>
              <span>{m['common.clear']()}</span>
            </Button>
          </>
        )}

      </PopoverContent>
    </Popover>
  );
}