import { createContext, type ReactNode, useContext } from 'react';
import type { Table } from '@tanstack/react-table';


export interface IDataTableContext<TData> {
  table: Table<TData>;
  loading?: boolean;
}

export interface IDataTableProviderProps<TData> extends IDataTableContext<TData> {
  children: ReactNode;
}

const DataTableContext = createContext<IDataTableContext<any> | undefined>(undefined);

export function DataTableProvider<TData>({ children, ...props }: IDataTableProviderProps<TData>) {

  return (
    <DataTableContext.Provider value={props}>
      {children}
    </DataTableContext.Provider>
  );
}

export function useDataTableContext<_>() {
  const context = useContext(DataTableContext);
  if (!context)
    throw new Error('useDataTable must be used within a DataTableProvider');

  return context;
}
