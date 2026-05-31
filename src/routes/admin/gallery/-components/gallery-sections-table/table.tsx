import { useEffect, useMemo, type ComponentProps, type FC } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { gallerySectionColumns } from './columns.tsx';
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
import { IconFileDownload, IconRefresh } from '@tabler/icons-react';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import {
  GallerySectionSheet,
  GallerySectionSheetMode,
  GallerySectionSheetProvider,
  GallerySectionSheetTrigger
} from '../gallery-section-sheet';
import { m } from '@/paraglide/messages';
import type { TSearchGallerySectionsRequestDto } from '@/features/gallery-sections/dtos/search-gallery-section.ts';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchGallerySectionsRequestDto;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const GallerySectionsTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, search, canCreate, canUpdate, canDelete, ...divProps } = props;
  const queryClient = useQueryClient();

  const { data, isPending: isPendingData, isFetching: isFetchingData, refetch, error } = useQuery({
    ...orpc.admin.gallery.sections.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0
  });

  const { mutate: deleteSection, isPending: isDeleting } = useMutation({
    ...orpc.admin.gallery.sections.delete.mutationOptions(),
    onSuccess: () => {
      toast.success(m['pages.gallery_sections.index.table.delete_success']());
      void queryClient.invalidateQueries({ queryKey: orpc.admin.gallery.sections.search.key() });
    },
    onError: () => {
      toast.error(m['pages.gallery_sections.index.table.delete_error']());
    }
  });

  const columns = useMemo(() => gallerySectionColumns({
    disabled: isFetchingData || isDeleting,
    canUpdate: canUpdate,
    canDelete: canDelete,
    onDelete: (id: number) => deleteSection({ id: id })
  }), [isFetchingData, isDeleting, canUpdate, canDelete, deleteSection]);

  const { table, selectedItems, setRowSelection } = useDataTable({
    data: data?.items,
    page: data?.page,
    limit: 10,
    totalCount: data?.totalCount,
    pageCount: data?.pageCount,
    columns,
    initialState: {
      columnVisibility: { updatedAt: false },
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  const onExportToCsvClick = () => {
    if (!selectedItems.length) return;
    setRowSelection({});
    exportToCsv('gallery-sections.csv', selectedItems);
  };

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);

  return (
    <GallerySectionSheetProvider>
      <GallerySectionSheet onSuccess={() => refetch()}/>

      <div className={cn('space-y-2 relative', className)} {...divProps}>
        <DataTableProvider table={table} loading={isPendingData}>
          <DataTableToolbar>
            <div className="flex-1"/>

            {canCreate && (
              <GallerySectionSheetTrigger
                variant="ghost"
                size="sm"
                options={{ mode: GallerySectionSheetMode.Create }}
              />
            )}
            <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetchingData}>
              <IconRefresh/>
            </Button>
          </DataTableToolbar>

          <DataTable skeletonTableCellClassName="h-[49px]"/>
          <DataTablePagination/>

          <DataTableActionBar disabled={isFetchingData}>
            <ActionBarButton text="CSV" icon={IconFileDownload} onClick={onExportToCsvClick}/>
          </DataTableActionBar>
        </DataTableProvider>
      </div>
    </GallerySectionSheetProvider>
  );
};
