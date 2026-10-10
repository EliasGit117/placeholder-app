import { type ComponentProps, type FC, useEffect, useMemo } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconRefresh } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import {
  DataTable,
  DataTablePagination,
  DataTableProvider,
  DataTableToolbar,
  useDataTable,
} from '@/components/data-table';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import type { TSearchBrandsRequestDto } from '@/features/brands/admin/dtos/search-brands.ts';
import { BrandSheet, BrandSheetMode, BrandSheetProvider, BrandSheetTrigger, useBrandSheet } from '../brand-sheet';
import { brandColumns } from './columns.tsx';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchBrandsRequestDto;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const BrandsTable: FC<IProps> = (props) => (
  <BrandSheetProvider>
    <BrandsTableContent {...props}/>
    <BrandSheet/>
  </BrandSheetProvider>
);

const BrandsTableContent: FC<IProps> = (props) => {
  'use no memo';

  const { className, search, canCreate, canUpdate, canDelete, ...divProps } = props;
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { open } = useBrandSheet();

  const { data, isPending, isFetching, refetch, error } = useQuery({
    ...orpc.admin.brands.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0,
  });

  const { mutate: deleteBrand, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => orpc.admin.brands.delete.call({ id }),
    onSuccess: () => {
      toast.success(m['pages.brands.index.table.delete_success']());
      void queryClient.invalidateQueries({ queryKey: orpc.admin.brands.search.key() });
      void queryClient.invalidateQueries({ queryKey: orpc.admin.brands.getAll.key() });
    },
    onError: (err: Error) => {
      toast.error(m['pages.brands.index.table.delete_error'](), { description: err.message });
    },
  });

  const columns = useMemo(() => brandColumns({
    canUpdate,
    canDelete,
    onEdit: (brand) => open({ mode: BrandSheetMode.Update, brand }),
    onDelete: async (id: number) => {
      const confirmed = await confirm({
        title: m['pages.brands.index.table.delete_title'](),
        description: m['pages.brands.index.table.delete_description'](),
        confirmText: m['common.delete'](),
        cancelText: m['common.cancel'](),
        confirmButton: { variant: 'destructive' },
      });

      if (confirmed)
        deleteBrand(id);
    },
  }), [canUpdate, canDelete, open, confirm, deleteBrand]);

  const { table } = useDataTable({
    data: data?.items,
    page: data?.page,
    limit: 10,
    totalCount: data?.totalCount,
    pageCount: data?.pageCount,
    columns,
    initialState: {
      columnVisibility: { id: false, updatedAt: false },
      columnPinning: { right: ['actions'] },
    },
  });

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);

  return (
    <div className={cn('space-y-2 relative', className)} {...divProps}>
      <DataTableProvider table={table} loading={isPending}>
        <DataTableToolbar>
          <div className="ml-auto flex items-center gap-1">
            {canCreate && <BrandSheetTrigger variant="ghost" size="sm" breakpoint="lg"/>}

            <AdaptiveButton
              variant="ghost"
              size="sm"
              breakpoint="lg"
              icon={IconRefresh}
              text={m['common.refresh']()}
              onClick={() => refetch()}
              disabled={isFetching || isDeleting}
            />
          </div>
        </DataTableToolbar>

        <DataTable skeletonTableCellClassName="h-[41px]"/>
        <DataTablePagination/>
      </DataTableProvider>
    </div>
  );
};
