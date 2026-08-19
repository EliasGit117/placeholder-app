import { useEffect, useMemo, type ComponentProps, type FC } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { orderColumns } from './columns.tsx';
import {
  DataTable, DataTableActionBar,
  DataTablePagination,
  DataTableProvider,
  DataTableToolbar,
  useDataTable
} from '~/src/components/data-table';
import { exportToCsv } from '@/lib/utils/csv.ts';
import { cn } from '@/lib/utils';
import { ActionBarButton } from '@/components/data-table/action-bar.tsx';
import { IconFileDownload, IconRefresh } from '@tabler/icons-react';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { m } from '@/paraglide/messages';
import type { TSearchOrdersRequestDto } from '@/features/orders/admin/dtos/search-orders.ts';
import type { TOrderDto } from '@/features/orders/common/dtos/order.ts';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchOrdersRequestDto;
}

export const OrdersTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, search, ...divProps } = props;

  const { data, isPending: isPendingData, isFetching: isFetchingData, refetch, error } = useQuery({
    ...orpc.admin.orders.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0,
  });

  const columns = useMemo(() => orderColumns({
    disabled: isFetchingData,
  }), [isFetchingData]);


  const { table, selectedItems, setRowSelection } = useDataTable({
    data: data?.items,
    page: data?.page,
    limit: 10,
    totalCount: data?.totalCount,
    pageCount: data?.pageCount,
    columns: columns,
    initialState: {
      columnVisibility: {
        items: false,
        deliveryMethod: false
      } satisfies Partial<Record<keyof TOrderDto, boolean>>,
      columnPinning: {
        left: ['select'],
        right: ['actions']
      }
    }
  });


  const onExportToCsvClick = () => {
    if (!selectedItems.length)
      return;

    setRowSelection({});
    exportToCsv('orders.csv', selectedItems);
  };

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);


  return (
    <div className={cn('space-y-2 relative', className)} {...divProps}>
      <DataTableProvider table={table} loading={isPendingData}>
        <DataTableToolbar>
          <div className="ml-auto flex items-center gap-1">
            <AdaptiveButton
              variant="ghost"
              size="sm"
              breakpoint="lg"
              icon={IconRefresh}
              text={m['common.refresh']()}
              onClick={() => refetch()}
              disabled={isFetchingData}
            />
          </div>
        </DataTableToolbar>

        <DataTable skeletonTableCellClassName="h-[41px]"/>
        <DataTablePagination/>

        <DataTableActionBar disabled={isFetchingData}>
          <ActionBarButton text="CSV" icon={IconFileDownload} onClick={onExportToCsvClick}/>
        </DataTableActionBar>
      </DataTableProvider>
    </div>
  );
};
