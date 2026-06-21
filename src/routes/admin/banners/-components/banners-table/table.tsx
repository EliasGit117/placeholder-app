import { type ComponentProps, type FC, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { toast } from 'sonner';
import { IconRefresh } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { bannerColumns } from './columns.tsx';
import type { TBannerRowDto } from '@/features/banners/dtos/banner-row.ts';
import { BannerSheet, BannerSheetProvider, BannerSheetTrigger } from '../banner-sheet';
import {
  BannerReorderSheet,
  BannerReorderSheetProvider,
  BannerReorderSheetTrigger
} from '../banner-reorder-sheet';
import {
  DataTable,
  DataTableProvider,
  DataTableToolbar,
  useDataTable
} from '@/components/data-table';
import { AdaptiveButton } from '@/components/ui/adaptive-button';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';


interface IProps extends ComponentProps<'div'> {
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export const BannersTable: FC<IProps> = (props) => {
  'use no memo';

  const { className, canCreate, canUpdate, canDelete, ...divProps } = props;
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const { data: banners = [], isPending, isFetching, refetch, error } = useQuery(
    orpc.admin.banners.getAll.queryOptions()
  );

  // All banners load once; filters are applied client-side off the URL search.
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const { filtered } = useMemo(() => applyFilters(banners, search), [banners, search]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() });

  const { mutateAsync: deleteBanner } = useMutation({
    mutationFn: (id: number) => orpc.admin.banners.delete.call({ id }),
    onSuccess: invalidate
  });

  const columns = useMemo(
    () =>
      bannerColumns({
        canDelete,
        onDelete: async (id: number) => {
          const confirmed = await confirm({
            title: m['pages.banners.index.delete_confirm_title'](),
            description: m['pages.banners.index.delete_confirm_description'](),
            confirmText: m['common.delete'](),
            cancelText: m['common.cancel'](),
            confirmButton: { variant: 'destructive' }
          });

          if (confirmed)
            toast.promise(deleteBanner(id), {
              loading: m['pages.banners.index.deleting'](),
              success: () => m['pages.banners.index.delete_success'](),
              error: (err: Error) => err?.message ?? m['pages.banners.index.delete_error']()
            });
        }
      }),
    [canDelete, confirm, deleteBanner]
  );

  // All matching banners load at once — no server pagination. One page holds the lot.
  const { table } = useDataTable({
    data: filtered,
    columns,
    totalCount: filtered.length,
    pageCount: 1,
    page: 1,
    limit: Math.max(filtered.length, 5),
    initialState: {
      columnVisibility: { id: false, updatedAt: false, },
      columnPinning: { right: ['actions'] }
    }
  });

  useEffect(() => {
    if (error == null)
      return;

    toast.error(error.name, { description: error.message });
  }, [error]);

  return (
    <BannerSheetProvider>
      <BannerReorderSheetProvider>
        <div className={cn('space-y-2 relative', className)} {...divProps}>
          <DataTableProvider table={table} loading={isPending}>
            <DataTableToolbar>
              <div className="ml-auto flex items-center gap-1">
                {canUpdate && (
                  <BannerReorderSheetTrigger
                    size="sm"
                    variant="ghost"
                    disabled={isFetching}
                    breakpoint='lg'
                  />
                )}

                {canCreate && (<BannerSheetTrigger variant="ghost" size="sm" breakpoint='lg'/>)}

                <AdaptiveButton
                  variant="ghost"
                  size="sm"
                  breakpoint='lg'
                  icon={IconRefresh}
                  text={m['common.refresh']()}
                  onClick={() => refetch()}
                  disabled={isFetching}
                />
              </div>
            </DataTableToolbar>

            <DataTable skeletonTableCellClassName="h-[49px]"/>
          </DataTableProvider>
        </div>

        <BannerSheet/>
        <BannerReorderSheet/>
      </BannerReorderSheetProvider>
    </BannerSheetProvider>
  );
};


function toStringArray(value: unknown): string[] {
  if (value == null)
    return [];

  return Array.isArray(value) ? value.map(String) : [String(value)];
}

// Filters the loaded banners against the data-table's URL search state. Keys
// match the column accessors: `state` (multi-select), `titleRo` (text),
// `createdAt` (date range).
function applyFilters(banners: TBannerRowDto[], search: Record<string, unknown>) {
  const states = toStringArray(search.state).filter(Boolean);
  const title = typeof search.titleRo === 'string' ? search.titleRo.trim().toLowerCase() : '';
  const range = search.createdAt && typeof search.createdAt === 'object'
    ? (search.createdAt as { from?: string; to?: string })
    : undefined;
  const fromTime = range?.from ? new Date(range.from).getTime() : undefined;
  const toTime = range?.to ? new Date(range.to).getTime() : undefined;

  const hasActiveFilters = states.length > 0 || title.length > 0 || fromTime != null || toTime != null;

  const filtered = banners.filter((banner) => {
    if (states.length > 0 && !states.includes(banner.state))
      return false;

    if (title && !(banner.titleRo ?? '').toLowerCase().includes(title))
      return false;

    if (fromTime != null || toTime != null) {
      const created = new Date(banner.createdAt).getTime();
      if (fromTime != null && created < fromTime)
        return false;
      if (toTime != null && created > toTime)
        return false;
    }

    return true;
  });

  return { filtered, hasActiveFilters };
}
