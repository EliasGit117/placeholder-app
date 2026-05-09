import { type ComponentProps, type PropsWithChildren, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type Column } from '@tanstack/react-table';
import { DataTableSortPopover } from '@/components/data-table/sort-popover';
import { DataTableColumnsOptions } from '@/components/data-table/columns-options.tsx';
import { DataTableTextFilter } from '@/components/data-table/text-filter';
import { ColumnFilterType } from '@/components/data-table/types/tanstack-table-meta';
import { useDataTableContext } from '@/components/data-table/context';
import { DataTableNumberFilter } from '@/components/data-table/number-filter';
import { DataTableMultiSelectFilter } from '@/components/data-table/multi-select-filter';
import { DataTableSelectFilter } from '@/components/data-table/select-filter';
import { DataTableDateFilter } from '@/components/data-table/date-filter';
import { DataTableDateRangeFilter } from '@/components/data-table/date-range-filter';
import { DataTableNumberRangeFilter } from '@/components/data-table/number-range-filter';
import { IconFilterOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


interface IDataTableToolbarProps<_> extends PropsWithChildren<ComponentProps<'div'>> {}

export function DataTableToolbar<TData>(props: IDataTableToolbarProps<TData>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { table } = useDataTableContext();
  const { className, children, ...restOfProps } = props;
  const isFiltered = table.getState().columnFilters.length > 0;
  const columns = useMemo(() => table.getAllColumns().filter((column) => column.getCanFilter()), [table]);
  const onReset = useCallback(() => table.resetColumnFilters(), [table]);

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn('flex flex-col w-full gap-4', className)}
      {...restOfProps}
    >
      <div className="flex items-center gap-2">
        <DataTableColumnsOptions/>
        <DataTableSortPopover/>
        {children}
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-2">
        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column}/>
        ))}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="border-dashed"
            onClick={onReset}
          >
            <IconFilterOff className='text-muted-foreground'/>
            <span>{m['common.clear']()}</span>
          </Button>
        )}
      </div>
    </div>
  );
}

interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>(props: DataTableToolbarFilterProps<TData>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { column } = props;
  const columnMeta = column.columnDef.meta;

  const onFilterRender = useCallback(() => {
    if (!columnMeta?.filter)
      return null;

    switch (columnMeta.filter.type) {

      case ColumnFilterType.Text:
        return <DataTableTextFilter column={column} key={column.id}/>;

      case ColumnFilterType.Number:
        return <DataTableNumberFilter column={column} key={column.id}/>;

      case ColumnFilterType.NumberRange:
        return <DataTableNumberRangeFilter column={column} key={column.id}/>;

      case ColumnFilterType.Select:
        return <DataTableSelectFilter column={column} key={column.id}/>;

      case ColumnFilterType.MultiSelect:
        return <DataTableMultiSelectFilter column={column} key={column.id}/>;

      case ColumnFilterType.Date:
        return <DataTableDateFilter column={column} key={column.id}/>;

      case ColumnFilterType.DateRange:
        return <DataTableDateRangeFilter column={column} key={column.id}/>;

      case ColumnFilterType.Custom:
        return columnMeta.filter.render({ column });

      default:
        return null;
    }
  }, [column, columnMeta]);

  return onFilterRender();
}