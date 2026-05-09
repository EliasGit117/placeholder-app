import { useCallback, useMemo, useState } from 'react';
import type { Updater, ColumnDef, ColumnFiltersState, SortingState } from '@tanstack/react-table';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import { z } from 'zod';


interface IUseDataTableSearchProps<TData> {
  columns: ColumnDef<TData, any>[];
  pageOnSearchChange?: number | 'none';
  replace?: boolean;
}

export function useDataTableSearch<TData>({ columns, pageOnSearchChange = 1, replace = true }: IUseDataTableSearchProps<TData>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const columnsMap = useMemo(() => createColumnsMap<TData>(columns), [columns],);
  const initialFilters = useMemo(() => toFilterState(search ?? {}, columnsMap), [search, columnsMap]);
  const [columnFiltersState, _setColumnFiltersState] = useState<ColumnFiltersState>(initialFilters);

  const debouncedSetFilter = useDebouncedCallback((filters: ColumnFiltersState) => {
    const clean = cleanObj(fromFilterStateToObj(filters, columnsMap));
    void navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        ...resetKeys(columnsMap),
        ...clean,
        page: pageOnSearchChange !== 'none' && pageOnSearchChange
      }),
      replace: replace
    });
  }, 300);

  const setColumnFiltersState = useCallback((updater: Updater<ColumnFiltersState>) => {
    _setColumnFiltersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      debouncedSetFilter(next);
      return next;
    });
  }, [debouncedSetFilter]);

  const sortingState = useMemo(() => getSortingState(search), [search]);
  const setSortingState = useCallback((updateSorting: Updater<SortingState>) => {
    const next = typeof updateSorting === 'function' ? updateSorting(sortingState) : updateSorting;
    const [first] = next;

    const newSearch: any = {
      [PAGE_KEY]: first ? 1 : undefined,
      [SORT_BY_KEY]: first?.id,
      [DIRECTION_KEY]: first ? (first.desc ? DESC_KEY : ASC_KEY) : undefined
    };

    void navigate({ to: '.', replace: replace, search: prev => ({ ...prev, ...newSearch }) });
  }, [navigate, sortingState]);

  return { columnFiltersState, setColumnFiltersState, sortingState, setSortingState };
}


// Filter helpers
const toFilterState = (obj: Record<string, unknown>, keysMap: Record<string, string | undefined>): ColumnFiltersState => {
  const reversedMap = Object.fromEntries(Object.entries(keysMap).map(([k, v]) => [v, k]));
  const keys = Object.values(reversedMap);

  return Object.entries(obj)
    .map(([id, value]) => ({ id: reversedMap[id] ?? id, value: value }))
    .filter(item => keys.includes(item.id));
};


function createColumnsMap<TData>(columns: ColumnDef<TData, any>[],): Record<string, string> {
  const data: Record<string, string> = {};

  columns.forEach((col) => {
    const key =
      col.meta?.key ??
      ('accessorKey' in col ? col.accessorKey : col.id);

    if ('accessorKey' in col && col.accessorKey) {
      const accessorKey = String(col.accessorKey);

      data[accessorKey] = String(key);
      data[accessorKey.replaceAll('.', '_')] = String(key);
    } else if (col.id) {
      const idKey = String(col.id);
      data[idKey] = String(col.meta?.key ?? col.id);
    }
  });

  return data;
}


function fromFilterStateToObj(filters: ColumnFiltersState, keysMap: Record<string, string | undefined>,): Record<string, unknown> {
  return Object.fromEntries(filters.map((f) => [(keysMap[f.id] ?? f.id), f.value]));
}

function cleanObj(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v != null && v !== ''));
}

function resetKeys(keysMap: Record<string, string | undefined>) {
  return Object.fromEntries(Object.values(keysMap).map((key) => [key, undefined]));
}


function getSortingState(obj: unknown): SortingState {
  const { data, success } = sortSchema.safeParse(obj);
  if (!success || !data?.sort || !data.dir)
    return [];

  return [{ id: data.sort, desc: data.dir === DESC_KEY}];
}

const PAGE_KEY = 'page';
const SORT_BY_KEY = 'sort';
const DIRECTION_KEY = 'dir';
const ASC_KEY = 'asc';
const DESC_KEY = 'desc';

export const directionSchema = z.enum(['asc', 'desc']);

const sortSchema = z.object({
  sort: z.string().optional(),
  dir: z.enum([ASC_KEY, DESC_KEY]).optional()
});
