import { useEffect, useMemo, type ComponentProps, type FC } from 'react';
import type { TSearchSessionsRequestDto } from '@/features/sessions/schemas/search-sessions.ts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { sessionColumns } from '@/routes/admin/sessions/-components/sessions-table/columns.tsx';
import {
  DataTable, DataTableActionBar,
  DataTablePagination,
  DataTableProvider,
  DataTableToolbar,
  useDataTable
} from '~/src/components/data-table';
import { exportToCsv } from '@/lib/utils/csv.ts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ActionBarButton } from '@/components/data-table/action-bar.tsx';
import { IconFileDownload, IconRefresh, IconTrash } from '@tabler/icons-react';
import type { TSessionBriefDto } from '@/features/sessions/schemas/session-brief.ts';
import { Button } from '@/components/ui/button.tsx';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchSessionsRequestDto;
  canDelete?: boolean;
}

export const SessionsTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, canDelete, search, ...divProps } = props;

  const { data, isPending: isPendingData, isFetching: isFetchingData, refetch, error } = useQuery({
    ...orpc.admin.sessions.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0,
  });

  // const { mutate: revokeSessions, isPending: isRevokingSession } = useMutation({
  //   ...sessions_delete_revoke_MutationOptions(),
  //   onSuccess: () => {
  //     void queryClient.invalidateQueries({ queryKey: sessions_post_search_QueryKeys({ body: search }) });
  //     setRowSelection({});
  //   }
  // });

  const columns = useMemo(() => sessionColumns({
    disabled: isFetchingData,
    canDelete: canDelete,
    // onRevokeClick: (id) => revokeSessions({ query: { ids: [id] } })
    onRevokeClick: () => {}
  }), [isFetchingData, canDelete]);


  const { table, selectedItems, setRowSelection } = useDataTable({
    data: data?.items,
    page: data?.page,
    limit: 10,
    totalCount: data?.totalCount,
    pageCount: data?.pageCount,
    columns: columns,
    initialState: {
      columnVisibility: {
        id: false,
        updatedAt: false,
        userId: false
      } satisfies Partial<Record<keyof TSessionBriefDto, boolean>>,
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
    exportToCsv('sessions.csv', selectedItems);
  };


  const revokeSelectedSession = () => {
    if (selectedItems?.length <= 0)
      return;

    // revokeSessions({ query: { ids: selectedItems.map(item => item.id) } });
  };

  const isRevokingSession = false;

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);


  return (
    <div className={cn('space-y-2 relative', className)} {...divProps}>
      <DataTableProvider table={table} loading={isPendingData}>
        <DataTableToolbar>
          <Button variant='ghost' size='icon-sm' onClick={() => refetch()} disabled={isFetchingData} className='ml-auto'>
            <IconRefresh/>
          </Button>
        </DataTableToolbar>

        <DataTable skeletonTableCellClassName="h-[49px]"/>
        <DataTablePagination/>

        <DataTableActionBar disabled={isFetchingData || isRevokingSession}>
          <ActionBarButton text="CSV" icon={IconFileDownload} onClick={onExportToCsvClick}/>
          {canDelete && (
            <ActionBarButton
              text='Revoke'
              // text={m['pages.sessions.list.table.revoke']()}
              icon={IconTrash}
              variant="destructive"
              onClick={revokeSelectedSession}
            />
          )}
        </DataTableActionBar>
      </DataTableProvider>
    </div>
  );
};