import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import {
  IconAlertTriangle,
  IconCalendar,
  IconCircleCheck,
  IconCircleDot,
  IconDots,
  IconExternalLink,
  IconEyeOff,
  IconHash,
  IconPhoto,
  IconPhotoOff,
  IconTextSize,
  IconTrash,
  type TablerIcon
} from '@tabler/icons-react';
import { ColumnFilterType, DataTableColumnHeader } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';
import type { TBannerImageDto } from '@/features/banners/dtos/banner-image.ts';
import type { TBannerBriefDto } from '@/features/banners/dtos/banner-brief.ts';
import type { BannerImageStatus } from '@/features/banners/consts/banner-image-status.ts';


interface IOptions {
  canDelete?: boolean;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<TBannerBriefDto>();

const stateMeta: Record<BannerState, { label: () => string; icon: TablerIcon }> = {
  [BannerState.ACTIVE]: { label: () => m['pages.banners.detail.state_active'](), icon: IconCircleCheck },
  [BannerState.HIDDEN]: { label: () => m['pages.banners.detail.state_hidden'](), icon: IconEyeOff }
};

const imageStatusMeta: Record<BannerImageStatus, { label: () => string; icon: TablerIcon; problem: boolean }> = {
  complete: { label: () => m['pages.banners.index.status_complete'](), icon: IconCircleCheck, problem: false },
  partial: { label: () => m['pages.banners.index.status_partial'](), icon: IconAlertTriangle, problem: true },
  empty: { label: () => m['pages.banners.index.status_empty'](), icon: IconAlertTriangle, problem: true }
};

export const bannerColumns = (options: IOptions) => {
  const { canDelete, onDelete } = options;

  const stateFilterOptions = Object.entries(stateMeta).map(([value, meta]) => ({
    title: meta.label(),
    value,
    icon: meta.icon
  }));

  const imageStatusFilterOptions = Object.entries(imageStatusMeta).map(([value, meta]) => ({
    title: meta.label(),
    value,
    icon: meta.icon
  }));

  return [
    columnHelper.accessor('id', {
      size: 20,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">{getValue()}</span>
      ),
      meta: {
        label: m['common.id'](),
        icon: IconHash,
        skeletonClassName: 'h-4 w-10'
      }
    }),

    columnHelper.display({
      id: 'image',
      size: 84,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <BannerImageCell image={row.original.mobileImage} aspectClass="aspect-[6/5]"/>
          <BannerImageCell image={row.original.image} aspectClass="aspect-[3/1]"/>
        </div>
      ),
      meta: {
        label: m['pages.banners.index.col_preview'](),
        icon: IconPhoto,
        skeletonItem: (
          <div className="flex items-center gap-2">
            <Skeleton className={cn('aspect-[6/5] h-12 rounded-md')}/>
            <Skeleton className={cn('aspect-[3/1] h-12 rounded-md')}/>
          </div>
        )
      }
    }),

    columnHelper.accessor('titleRo', {
      size: 220,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => (
        <Link
          className={cn('text-xs underline underline-offset-2', !getValue() && 'text-muted-foreground')}
          to="/admin/banners/$bannerId"
          params={{ bannerId: row.original.id }}
        >
          {getValue() || m['pages.banners.index.untitled']()}
        </Link>
      ),
      meta: {
        label: m['pages.banners.index.col_title_ro'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text }
      }
    }),

    columnHelper.accessor('titleRu', {
      size: 220,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => (
        <Link
          className={cn('text-xs underline underline-offset-2', !getValue() && 'text-muted-foreground')}
          to="/admin/banners/$bannerId"
          params={{ bannerId: row.original.id }}
        >
          {getValue() || m['pages.banners.index.untitled']()}
        </Link>
      ),
      meta: {
        label: m['pages.banners.index.col_title_ru'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text }
      }
    }),

    columnHelper.accessor('state', {
      size: 120,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const meta = stateMeta[getValue()];
        const Icon = meta.icon;
        return (
          <Badge variant={getValue() === BannerState.ACTIVE ? 'outline' : 'secondary'} className="rounded-sm min-h-6">
            <Icon size={12}/>
            <span>{meta.label()}</span>
          </Badge>
        );
      },
      meta: {
        label: m['pages.banners.index.col_status'](),
        icon: IconCircleDot,
        skeletonClassName: 'h-5.5 w-20 rounded-sm',
        filter: {
          type: ColumnFilterType.MultiSelect,
          options: stateFilterOptions
        }
      }
    }),

    columnHelper.accessor('imageStatus', {
      size: 150,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const meta = imageStatusMeta[getValue()];
        const Icon = meta.icon;
        return (
          <Badge
            variant={meta.problem ? 'outline' : 'secondary'}
            className={cn('rounded-sm min-h-6', meta.problem && 'border-amber-500/50 text-amber-500')}
          >
            <Icon size={12}/>
            <span>{meta.label()}</span>
          </Badge>
        );
      },
      meta: {
        label: m['pages.banners.index.col_problem'](),
        icon: IconAlertTriangle,
        skeletonClassName: 'h-5.5 w-24 rounded-sm',
        filter: {
          type: ColumnFilterType.MultiSelect,
          options: imageStatusFilterOptions
        }
      }
    }),

    columnHelper.accessor('createdAt', {
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs">{format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}</span>
      ),
      meta: {
        label: m['common.created'](),
        icon: IconCalendar,
        skeletonClassName: 'h-4 w-28',
        filter: { type: ColumnFilterType.DateRange }
      }
    }),

    columnHelper.accessor('updatedAt', {
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs">{format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}</span>
      ),
      meta: {
        label: m['common.updated'](),
        icon: IconCalendar,
        skeletonClassName: 'h-4 w-28'
      }
    }),

    columnHelper.display({
      id: 'actions',
      size: 40,
      meta: {
        label: m['common.actions'](),
        skeletonClassName: 'size-6 ml-auto'
      },
      cell: ({ row }) => {
        const banner = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-xs" variant="ghost">
                  <IconDots/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-fit min-w-42" align="end">
                <DropdownMenuLabel>{m['common.actions']()}</DropdownMenuLabel>
                <DropdownMenuSeparator/>

                <DropdownMenuItem asChild>
                  <Link to="/admin/banners/$bannerId" params={{ bannerId: banner.id }}>
                    <IconExternalLink className="mr-2 size-4"/>
                    <span>{m['common.open']()}</span>
                  </Link>
                </DropdownMenuItem>

                {canDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(banner.id)}>
                    <IconTrash className="mr-2 size-4"/>
                    <span>{m['common.delete']()}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    })
  ];
};


function BannerImageCell({ image, aspectClass }: { image?: TBannerImageDto | null; aspectClass: string }) {
  const placeholder = thumbhashToDataUrl(image?.thumbhash);

  return (
    <div
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
      className={cn(
        'flex h-12 items-center justify-center overflow-hidden rounded-md bg-muted bg-cover bg-center border shrink-0',
        aspectClass
      )}
    >
      {image ?
        <img
          alt=""
          src={image.url}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        /> :
        <IconPhotoOff className="size-3.5 text-muted-foreground"/>}
    </div>
  );
}
