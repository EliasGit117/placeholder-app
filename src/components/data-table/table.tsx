import { useDataTableContext } from '@/components/data-table/context';
import { flexRender } from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { getCommonPinningStyles } from '@/components/data-table/utils/pinning';
import { Skeleton } from '@/components/ui/skeleton';
import { m } from '@/paraglide/messages';


interface DataTableProps<_> extends ComponentProps<'div'> {
  actionBar?: ReactNode;
  showSkeleton?: boolean;
  defaultSkeletonClassName?: string;
  skeletonTableCellClassName?: string;
  borderedPinnedColumns?: boolean;
}

export function DataTable<TData>(props: DataTableProps<TData>) {
  // noinspection BadExpressionStatementJS
  'use no memo';

  const { table, loading } = useDataTableContext();
  const {
    actionBar,
    children,
    className,
    skeletonTableCellClassName,
    defaultSkeletonClassName,
    showSkeleton = true,
    borderedPinnedColumns = false,
    ...restOfProps
  } = props;

  const headerGroups = table.getHeaderGroups();
  const rowModel = table.getRowModel();
  const visibleColumns = table.getVisibleLeafColumns();
  const pageSize = table.getState().pagination.pageSize ?? 10;

  return (
    <div className={cn('flex w-full flex-col gap-2.5 overflow-auto', className)} {...restOfProps}>
      {children}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ ...getCommonPinningStyles({ column: header.column, withBorder: borderedPinnedColumns }) }}
                    className={cn(i === 0)}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {(showSkeleton && loading) ? (
              Array.from({ length: pageSize }).map((_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`}>
                  {visibleColumns.map((column, colIndex) => (
                    <TableCell
                      key={`skeleton-cell-${rowIndex}-${colIndex}`}
                      className={cn("h-10", skeletonTableCellClassName)}
                      style={{ ...getCommonPinningStyles({ column, withBorder: borderedPinnedColumns }) }}
                    >
                      {column.columnDef.meta?.skeletonItem ?? (
                        <Skeleton
                          className={cn(
                            'h-4 w-full',
                            defaultSkeletonClassName,
                            column.columnDef.meta?.skeletonClassName
                          )}/>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rowModel.rows?.length ? (
              rowModel.rows.map((row) => {
                const isSelected = row.getIsSelected();

                return (
                  <TableRow key={row.id} data-state={isSelected && 'selected'} className="group">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{ ...getCommonPinningStyles({ column: cell.column, row: row, withBorder: borderedPinnedColumns }) }}
                        className={cn(
                          !isSelected && 'group-hover:bg-(--muted-generated-25)!'
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>);
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns.length}
                  className="h-24 text-center"
                >
                  {m['components.data_table.no_results_found']()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}