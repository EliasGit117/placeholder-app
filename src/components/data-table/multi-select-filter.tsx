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


interface IDataTableMultiSelectFilter<TData, TValue> {
  column: Column<TData, TValue>;
}

export function DataTableMultiSelectFilter<TData, TValue>({ column }: IDataTableMultiSelectFilter<TData, TValue>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { meta } = column.columnDef;

  if (!meta || meta.filter?.type !== ColumnFilterType.MultiSelect) {
    throw new Error(
      'DataTableMultiSelectFilter requires ColumnFilterType.MultiSelect'
    );
  }

  const { label, filter } = meta;
  const options = filter.options;

  const filterValue =
    (column.getFilterValue() as TFacetedOptionValue[]) ?? [];
  const hasFilter = filterValue.length > 0;
  const title = label ?? column.id;

  const [open, setOpen] = useState(false);

  const selectedSet = useMemo(
    () => new Set(filterValue),
    [filterValue]
  );

  const selectedOptions = useMemo(
    () => options.filter((o) => selectedSet.has(o.value)),
    [options, selectedSet]
  );

  const onItemSelect = useCallback(
    (value: TFacetedOptionValue, isSelected: boolean) => {
      const next = isSelected
        ? filterValue.filter((v) => v !== value)
        : [...filterValue, value];

      column.setFilterValue(next.length ? next : undefined);
    },
    [filterValue, column]
  );

  const onReset = useCallback(
    () => column.setFilterValue(undefined),
    [column]
  );

  const onClearClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onReset();
    },
    [onReset]
  );

  return (
    <ButtonGroup>
      {hasFilter && (
        <Button
          size="icon-sm"
          variant="outline"
          className="border-dashed"
          aria-label={`Clear ${title} filter`}
          onClick={onClearClick}
        >
          <IconCircleX className="text-muted-foreground"/>
        </Button>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="border-dashed px-2.5!">
            {!hasFilter && <IconCirclePlus className="text-muted-foreground"/>}
            {title}

            {hasFilter && (
              <>
                <Separator orientation="vertical" className="mx-1 my-auto h-3.5"/>

                <Badge variant="secondary" className="border border-border rounded-sm px-1 font-normal lg:hidden">
                  {filterValue.length}
                </Badge>

                <div className="hidden items-center gap-1 lg:flex">
                  {filterValue.length > 2 ? (
                    <Badge variant="secondary" className="border border-border rounded-sm px-1 font-normal">
                      {filterValue.length} {m['common.selected']().toLowerCase()}
                    </Badge>
                  ) : (
                    selectedOptions.map((option) => (
                      <Badge
                        variant="secondary"
                        className="border border-border rounded-sm px-1 font-normal [&>svg]:size-2.5!"
                        key={`${option.value}`}
                      >
                        {option.icon && <option.icon className="text-muted-foreground"/>}
                        <span>{option.title}</span>
                      </Badge>
                    ))
                  )}
                </div>
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
                  const isSelected = selectedSet.has(option.value);

                  return (
                    <CommandItem
                      key={`${option.value}`}
                      data-checked={isSelected}
                      onSelect={() => onItemSelect(option.value, isSelected)}
                      className="group"
                    >
                      {option.icon && <option.icon className="text-muted-foreground"/>}
                      <span className="truncate">
                        {option.title}
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
                  <CommandItem onSelect={onReset} className="flex justify-center mt-1">
                    <IconCircleX/>
                    <span>{m['components.data_table.clear_filters']()}</span>
                  </CommandItem>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}