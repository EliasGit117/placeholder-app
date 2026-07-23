import { useEffect, useMemo, type ComponentProps, type FC } from 'react';
import type { TSearchSessionsRequestDto } from '@/features/sessions/common/dtos/search-sessions.ts';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { IconFileDownload, IconRefresh } from '@tabler/icons-react';
import type { TSessionBriefDto } from '@/features/sessions/admin/dtos/session-brief.ts';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { m } from '@/paraglide/messages';
import { authClient } from '@/lib/auth';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchSessionsRequestDto;
  canRevoke?: boolean;
}

export const SessionsTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, canRevoke, search, ...divProps } = props;
  const queryClient = useQueryClient();

  const { data, isPending: isPendingData, isFetching: isFetchingData, refetch, error } = useQuery({
    ...orpc.admin.sessions.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0,
  });

  const { mutate: revokeSession, isPending: isRevokingSession } = useMutation({
    mutationFn: ({ token }: { token: string }) => authClient.admin.revokeUserSession({
      sessionToken: token
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.admin.sessions.search.queryKey({ input: search ?? {} })
      });
    }
  });

  const columns = useMemo(() => sessionColumns({
    disabled: isFetchingData,
    canRevoke: canRevoke,
    onRevokeClick: (token) => revokeSession({ token: token }),
  }), [isFetchingData, canRevoke]);


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

        <DataTableActionBar disabled={isFetchingData || isRevokingSession}>
          <ActionBarButton text="CSV" icon={IconFileDownload} onClick={onExportToCsvClick}/>
        </DataTableActionBar>
      </DataTableProvider>
    </div>
  );
};