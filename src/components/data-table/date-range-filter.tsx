import { type ComponentProps, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { type Column } from '@tanstack/react-table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ColumnFilterType } from '@/components/data-table/types/tanstack-table-meta';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { type DateRange } from 'react-day-picker';
import { type TDateRange } from '@/components/data-table/types/schemas';
import { IconCalendar, IconCircleX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';



interface IDataTableDateRangeFilterProps<TData, TValue>
  extends ComponentProps<typeof Input> {
  column: Column<TData, TValue>;
}


export function DataTableDateRangeFilter<TData, TValue>(props: IDataTableDateRangeFilterProps<TData, TValue>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { column, className } = props;
  const meta = column.columnDef.meta;
  const title = meta?.label ?? column.id;

  const filterValue = column.getFilterValue() as TDateRange | undefined;


  if (meta?.filter?.type !== ColumnFilterType.DateRange)
    throw new Error('Filter must be a type Date');

  const disabledBefore = meta.filter?.disabledBefore;
  const disabledAfter = meta.filter?.disabledAfter;

  let disabled = [];

  if (!!disabledBefore)
    disabled.push({ before: disabledBefore });

  if (!!disabledAfter)
    disabled.push({ after: disabledAfter });

  const onReset = () => column.setFilterValue(undefined);

  const onSelect = (value: DateRange | undefined) => {
    if (!value) {
      column.setFilterValue(undefined);
      return;
    }

    // Expand dates to cover full days in local timezone
    let from = value.from;
    let to = value.to;

    if (from) {
      // Set to start of day (00:00:00.000)
      from = new Date(from);
      from.setHours(0, 0, 0, 0);
    }

    if (to) {
      // Set to end of day (23:59:59.999)
      to = new Date(to);
      to.setHours(23, 59, 59, 999);
    }

    column.setFilterValue({ from, to });
  };

  const dateText = useMemo(() => {
    if (!!filterValue) {
      let label = '';

      if (!!filterValue?.from)
        label += format(filterValue.from, 'dd.MM.yyyy');

      if (!!filterValue?.from && !!filterValue?.to)
        label += ' - ';

      if (!!filterValue?.to)
        label += format(filterValue.to, 'dd.MM.yyyy');

      return label;
    }

    return undefined;
  }, [filterValue]);

  const value: DateRange | undefined = !!filterValue ? { from: filterValue.from, to: filterValue.to } : undefined;

  return (
    <Popover>
      <PopoverTrigger className={className} asChild>
        <Button variant="outline" size="sm" className="border-dashed px-2.5!">
          {!!filterValue ? (
            <span
              role="button"
              aria-label={`Clear ${title} filter`}
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring p-0"
            >
              <IconCircleX/>
            </span>
          ) : (
            <IconCalendar/>
          )}

          <span className="flex items-center gap-2">
            <span>{title}</span>
            {!!dateText && (
              <>
                <Separator orientation="vertical" className="mx-0.5 my-auto data-[orientation=vertical]:h-4"/>
                <span className="text-xs">{dateText}</span>
              </>
            )}
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto overflow-hidden p-0 gap-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          captionLayout="dropdown"
          disabled={disabled}
          onSelect={onSelect}
        />

        {!!filterValue && (
          <div className="p-1 pt-0 space-y-1">
            <Separator/>
            <Button size="sm" variant="ghost" className="w-full" onClick={onReset}>
              <IconCircleX/>
              <span>{m['components.data_table.clear_filters']()}</span>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}