import { useEffect, useMemo, type ComponentProps, type FC } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { productColumns } from './columns.tsx';
import { ProductSheet, ProductSheetProvider, ProductSheetTrigger } from '../product-sheet';
import {
  DataTable,
  DataTableActionBar,
  DataTablePagination,
  DataTableProvider,
  DataTableToolbar,
  useDataTable
} from '~/src/components/data-table';
import { exportToCsv } from '@/lib/utils/csv.ts';
import { cn } from '@/lib/utils';
import { ActionBarButton } from '@/components/data-table/action-bar.tsx';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { toast } from 'sonner';
import { IconFileDownload, IconRefresh } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TSearchProductsRequestDto } from '@/features/products/admin/dtos/search-products.ts';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchProductsRequestDto;
  canCreate?: boolean;
  canDelete?: boolean;
}

export const ProductsTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, search, canCreate, canDelete, ...divProps } = props;
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data, isPending: isPendingData, isFetching: isFetchingData, refetch, error } = useQuery({
    ...orpc.admin.products.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0
  });

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    ...orpc.admin.products.delete.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.products.index.table.delete_success']());
      void queryClient.invalidateQueries({ queryKey: orpc.admin.products.search.key() });
    },
    onError: () => {
      toast.error(m['pages.products.index.table.delete_error']());
    }
  });

  const columns = useMemo(() => productColumns({
    disabled: isFetchingData || isDeleting,
    canDelete,
    onDelete: async (id: number) => {
      const confirmed = await confirm({
        title: m['pages.products.index.table.delete_title'](),
        description: m['pages.products.index.table.delete_description'](),
        confirmText: m['common.delete'](),
        cancelText: m['common.cancel'](),
        confirmButton: { variant: 'destructive' }
      });

      if (!confirmed) return;

      deleteProduct({ id });
    }
  }), [isFetchingData, isDeleting, canDelete, deleteProduct, confirm]);

  const { table, selectedItems, setRowSelection } = useDataTable({
    data: data?.items,
    page: data?.page,
    limit: 10,
    totalCount: data?.totalCount,
    pageCount: data?.pageCount,
    columns,
    initialState: {
      columnVisibility: { id: false, updatedAt: false },
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  const onExportToCsvClick = () => {
    if (!selectedItems.length) return;
    setRowSelection({});
    exportToCsv('products.csv', selectedItems);
  };

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);

  return (
    <ProductSheetProvider>
      <div className={cn('space-y-2 relative', className)} {...divProps}>
        <DataTableProvider table={table} loading={isPendingData}>
          <DataTableToolbar>
            <div className="ml-auto flex items-center gap-1">
              {canCreate && (
                <ProductSheetTrigger
                  variant="ghost"
                  size="sm"
                />
              )}

              <AdaptiveButton
                variant="ghost"
                size="sm"
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

      <ProductSheet/>
    </ProductSheetProvider>
  );
};
