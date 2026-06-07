import { useEffect, useMemo, type ComponentProps, type FC } from 'react';
import type { TSearchUsersRequestDto } from '@/features/users/schemas/search-users.ts';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { userColumns } from '@/routes/admin/users/-components/users-table/columns.tsx';
import {
  DataTable,
  DataTableActionBar,
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
import type { TUserBriefDto } from '@/features/users/schemas/user-brief.ts';
import { Button } from '@/components/ui/button.tsx';
import {
  UserSheet,
  UserSheetMode,
  UserSheetProvider,
  UserSheetTrigger
} from '@/routes/admin/users/-components/user-sheet';


interface IProps extends ComponentProps<'div'> {
  search?: TSearchUsersRequestDto;
  canCreate?: boolean;
  canUpdate?: boolean;
}

export const UsersTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, search, canCreate, canUpdate, ...divProps } = props;

  const { data, isPending: isPendingData, isFetching: isFetchingData, refetch, error } = useQuery({
    ...orpc.admin.users.search.queryOptions({ input: search ?? {} }),
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
    gcTime: 0
  });

  const columns = useMemo(() => userColumns({
    disabled: isFetchingData,
    canUpdate
  }), [isFetchingData, canUpdate]);

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
        banReason: false
      } satisfies Partial<Record<keyof TUserBriefDto, boolean>>,
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
    exportToCsv('users.csv', selectedItems);
  };

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);

  return (
    <UserSheetProvider>
      <UserSheet onSuccess={() => refetch()}/>

      <div className={cn('space-y-2 relative', className)} {...divProps}>
        <DataTableProvider table={table} loading={isPendingData}>
          <DataTableToolbar>
            <div className="ml-auto flex items-center gap-1">
              {canCreate && (
                <UserSheetTrigger variant="ghost" size="sm" options={{ mode: UserSheetMode.Create }}/>
              )}

              <Button variant="ghost" size="icon-sm" onClick={() => refetch()} disabled={isFetchingData}>
                <IconRefresh/>
              </Button>
            </div>
          </DataTableToolbar>

          <DataTable skeletonTableCellClassName="h-[49px]"/>
          <DataTablePagination/>

          <DataTableActionBar disabled={isFetchingData}>
            <ActionBarButton text="CSV" icon={IconFileDownload} onClick={onExportToCsvClick}/>
          </DataTableActionBar>
        </DataTableProvider>
      </div>
    </UserSheetProvider>
  );
};
