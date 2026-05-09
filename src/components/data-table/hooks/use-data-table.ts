import { useEffect, useMemo, useState } from 'react';
import { useDataTableSearch } from '@/components/data-table/hooks/use-data-table-search';
import type { TableOptions, VisibilityState, ColumnPinningState, RowSelectionState } from '@tanstack/react-table';
import { useReactTable, getCoreRowModel, } from '@tanstack/react-table';


interface IUseDataTableProps<TData> extends Omit<TableOptions<TData>,
  | 'state'
  | 'getCoreRowModel'
  | 'manualFiltering'
  | 'manualPagination'
  | 'manualSorting'
  | 'rowCount'
  | 'pageCount'
  | 'data'> {

  data?: TData[];
  page?: number;
  limit?: number;
  totalCount?: number;
  pageCount?: number;
  history?: 'push' | 'replace';
  pageOnSearchChange?: number | 'none';
  dataCompareStrategy?: 'ref' | 'stringify';
}


export function useDataTable<TData>(props: IUseDataTableProps<TData>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const {
    data: data = [],
    columns: columns = [],
    initialState,
    page = 1,
    totalCount = 1,
    pageCount = 1,
    limit = 10,
    history = 'replace',
    pageOnSearchChange,
    ...tableProps
  } = props;

  const { columnFiltersState, setColumnFiltersState, sortingState, setSortingState } = useDataTableSearch({
    columns: columns,
    pageOnSearchChange: pageOnSearchChange,
    replace: history === 'replace'
  });

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialState?.columnPinning ?? {
    left: [],
    right: []
  });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialState?.columnVisibility ?? {});

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(initialState?.rowSelection ?? {});
  const dataKey = useMemo(() => JSON.stringify(data ?? []), [data]);

  useEffect(() => {
    setRowSelection({});
  }, [dataKey]);

  const table = useReactTable({
    ...tableProps,
    data: data,
    columns: columns,

    defaultColumn: {
      filterFn: 'equals'
    },
    getCoreRowModel: getCoreRowModel(),

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSortingState,
    onColumnFiltersChange: setColumnFiltersState,
    onColumnPinningChange: setColumnPinning,

    rowCount: totalCount,
    pageCount: pageCount,
    state: {
      rowSelection: rowSelection,
      columnPinning: columnPinning,
      columnFilters: columnFiltersState,
      pagination: { pageIndex: page - 1, pageSize: limit },
      columnVisibility: columnVisibility,
      sorting: sortingState
    }
  });

  const selectedItems = useMemo(() => {
    return table.getSelectedRowModel().rows.map(r => r.original);
  }, [rowSelection, table]);

  return {
    table,
    columnFiltersState,
    setColumnFiltersState,
    rowSelection,
    setRowSelection,
    selectedItems
  };
}

