import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import {
  IconCalendar,
  IconCircleCheck,
  IconCircleDot,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDots,
  IconExternalLink,
  IconEyeOff,
  IconPhoto,
  IconTextSize,
  IconTrash,
  type TablerIcon
} from '@tabler/icons-react';
import { bannerDevices, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';
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
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';
import type { TBannerImageDto } from '@/features/banners/dtos/banner-image.ts';
import type { TBannerRowDto } from '@/features/banners/dtos/banner-row.ts';


interface IOptions {
  canDelete?: boolean;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<TBannerRowDto>();

const stateMeta: Record<BannerState, { label: () => string; icon: TablerIcon }> = {
  [BannerState.active]: { label: () => m['pages.banners.detail.state_active'](), icon: IconCircleCheck },
  [BannerState.hidden]: { label: () => m['pages.banners.detail.state_hidden'](), icon: IconEyeOff }
};

const deviceLabel: Record<BannerDevice, () => string> = {
  mobile: () => m['pages.banners.detail.device_mobile'](),
  tablet: () => m['pages.banners.detail.device_tablet'](),
  desktop: () => m['pages.banners.detail.device_desktop']()
};

const deviceIcon: Record<BannerDevice, TablerIcon> = {
  mobile: IconDeviceMobile,
  tablet: IconDeviceTablet,
  desktop: IconDeviceDesktop
};

export const bannerColumns = (options: IOptions) => {
  const { canDelete, onDelete } = options;

  const stateFilterOptions = Object.entries(stateMeta).map(([value, meta]) => ({
    title: meta.label(),
    value,
    icon: meta.icon
  }));

  return [
    // Columns ordered largest → smallest (desktop, tablet, mobile).
    ...[...bannerDevices].reverse().map((device) =>
      columnHelper.display({
        id: device,
        size: 96,
        header: ({ column }) => <DataTableColumnHeader column={column} title="" className="justify-center"/>,
        cell: ({ row }) => <DeviceImageCell image={row.original.images[device]} device={device}/>,
        meta: {
          label: deviceLabel[device](),
          icon: deviceIcon[device],
          skeletonClassName: cn(deviceThumbClass[device], 'w-auto rounded-md')
        }
      })
    ),

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
          <Badge
            variant={getValue() === BannerState.active ? 'outline' : 'secondary'}
            className="rounded-sm min-h-6"
          >
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


// Thumbnail aspect per breakpoint: mobile portrait, tablet 4:3, desktop 16:9.
// Fixed height; width follows the aspect ratio.
const deviceThumbClass: Record<BannerDevice, string> = {
  mobile: 'aspect-[10/16] h-12',
  tablet: 'aspect-[4/3] h-12',
  desktop: 'aspect-video h-12'
};

// Image comes straight from the row (getAll embeds it), so the thumbhash
// placeholder shows immediately — no per-cell request, no icon flash.
function DeviceImageCell({ image, device }: { image?: TBannerImageDto | null; device: BannerDevice }) {
  const placeholder = thumbhashToDataUrl(image?.thumbhash);

  return (
    <div
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-md border bg-muted bg-cover bg-center mx-auto',
        deviceThumbClass[device]
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
        <IconPhoto className="size-3.5 text-muted-foreground"/>}
    </div>
  );
}
