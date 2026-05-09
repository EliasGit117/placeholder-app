import { useDataTableContext } from '@/components/data-table/context';
import { type ComponentProps, useMemo } from 'react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button.tsx';
import { IconCheck, IconTableOptions } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


interface IDataTableColumnsOptionsProps<_> extends ComponentProps<typeof PopoverTrigger> {}

export function DataTableColumnsOptions<TData>({ ...props }: IDataTableColumnsOptionsProps<TData>) {
  // noinspection BadExpressionStatementJS
  "use no memo";

  const { table } = useDataTableContext();
  const columns = useMemo(() =>
    table
      .getAllColumns()
      .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide()), [table]
  );

  return (
    <Popover>
      <PopoverTrigger {...props} asChild>
        <Button
          aria-label="Toggle columns"
          role="combobox"
          variant="outline"
          className='w-7 sm:w-fit'
          size="sm"
        >
          <IconTableOptions/>
          <span className='sr-only sm:not-sr-only'>
            {m['components.data_table.columns']()}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="min-w-48 w-fit p-0 gap-1">
        <Command className='space-y-1'>
          <CommandInput
            placeholder={`${m['components.data_table.search_columns']()}...`}
            wrapperClassName='p-0'
            groupClassName='rounded-sm!'
          />

          <CommandList className="max-h-full">
            <CommandEmpty>
              {m['components.data_table.no_columns_found']()}
            </CommandEmpty>
            <CommandGroup className='p-0' heading={m['components.data_table.columns']()}>
              {columns.map((column) => {
                const Icon = column.columnDef.meta?.icon;

                return (
                  <CommandItem
                    key={column.id}
                    onSelect={() => column.toggleVisibility(!column.getIsVisible())}
                  >
                    {Icon && <Icon className='size-4 text-muted-foreground'/>}
                    <span className="truncate">
                      {column.columnDef.meta?.label ?? column.id}
                    </span>
                    <IconCheck
                      data-visible={column.getIsVisible()}
                      className='ml-auto size-4 shrink-0 data-[visible=false]:opacity-0'
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
