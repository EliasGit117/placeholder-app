import { useCallback, useMemo, useState } from 'react';
import type { Column } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  ColumnFilterType,
  type TFacetedOptionValue
} from '@/components/data-table/types/tanstack-table-meta';
import { ButtonGroup } from '@/components/ui/button-group.tsx';
import { IconCirclePlus, IconCircleX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


interface IDataTableSelectFilter<TData, TValue> {
  column: Column<TData, TValue>;
}

export function DataTableSelectFilter<TData, TValue>({ column }: IDataTableSelectFilter<TData, TValue>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { meta } = column.columnDef;
  if (!meta || meta.filter?.type !== ColumnFilterType.Select)
    throw new Error('DataTableSelectFilter requires ColumnFilterType.Select');


  const { label, filter } = meta;
  const options = filter.options;
  const filterValue = (column.getFilterValue() as TFacetedOptionValue) ?? undefined;
  const hasFilter = filterValue !== undefined;
  const title = label ?? column.id;
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(() => options.find((o) => o.value === filterValue), [options, filterValue]);
  const onItemSelect = useCallback((value: TFacetedOptionValue, isSelected: boolean) => column.setFilterValue(isSelected ? undefined : value), [column]);
  const onReset = useCallback(() => column.setFilterValue(undefined), [column]);

  return (
    <ButtonGroup>
      {hasFilter && (
        <Button
          size="icon-sm"
          variant="outline"
          className="border-dashed"
          aria-label={`Clear ${title} filter`}
          onClick={onReset}
        >
          <IconCircleX className="text-muted-foreground"/>
        </Button>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-dashed px-2.5!"
          >
            {!hasFilter && (<IconCirclePlus className="text-muted-foreground"/>)}
            {title}

            {hasFilter && selectedOption && (
              <>
                <Separator orientation="vertical" className="mx-1 my-auto h-3.5"/>
                <Badge variant="secondary" className="border border-border rounded-sm px-1 font-normal [&>svg]:size-2.5!">
                  {selectedOption.icon && <selectedOption.icon className="text-muted-foreground"/>}
                  <span>{selectedOption.title}</span>
                </Badge>
              </>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="min-w-52 w-fit p-0 gap-1" align="start">
          <Command className="space-y-1">
            {options.length > 5 && (
              <CommandInput placeholder={title} wrapperClassName="p-0" groupClassName="rounded-sm!"/>
            )}

            <CommandList className="max-h-72">
              <CommandEmpty>
                {m['components.data_table.no_results_found']()}
              </CommandEmpty>

              <CommandGroup className="p-0" heading={title}>
                {options.map((option) => {
                  const isSelected = option.value === filterValue;

                  return (
                    <CommandItem
                      key={`${option.value}`}
                      data-checked={isSelected}
                      onSelect={() => onItemSelect(option.value, isSelected)}
                    >
                      {option.icon && <option.icon className="text-muted-foreground"/>}
                      <span className="truncate">
                        <span>{option.title}</span>
                      </span>

                      {option.count && (
                        <Badge variant="secondary" className="border border-border ml-auto px-1.5 font-mono text-xs">
                          {option.count}
                        </Badge>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>

              {hasFilter && (
                <>
                  <CommandSeparator/>
                  <CommandGroup>
                    <CommandItem
                      onSelect={onReset}
                      className="flex justify-center"
                    >
                      <IconCircleX/>
                      <span>{m['components.data_table.clear_filters']()}</span>
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}