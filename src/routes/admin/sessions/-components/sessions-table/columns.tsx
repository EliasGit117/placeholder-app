import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ColumnFilterType, DataTableColumnHeader } from '@/components/data-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { UAParser } from 'ua-parser-js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  IconCalendar,
  IconCheck,
  IconHelpCircle,
  IconClock,
  IconCopy,
  IconWorld,
  IconDots,
  IconHash,
  IconInfoCircle,
  IconDeviceLaptop,
  IconDeviceMobile,
  IconSquareCheck,
  IconSquare,
  IconSquareMinus,
  IconTrash,
  IconUserCircle,
  IconUser,
  IconBrandChrome,
  IconBrandEdge,
  IconBrandFirefox,
  IconBrandSafari,
  IconBrandOpera
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { cn, pickFirstLetters } from '@/lib/utils';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard.ts';
import { m } from '@/paraglide/messages';
import type { TSessionBriefDto } from '@/features/sessions/schemas/session-brief.ts';
import { SessionState } from '@/features/sessions/schemas/search-sessions.ts';
import { Link } from '@tanstack/react-router';


interface IOptions {
  disabled?: boolean;
  canRevoke?: boolean;
  onRevokeClick?: (id: string) => void;
}


const columnHelper = createColumnHelper<TSessionBriefDto>();

export const sessionColumns = (options?: IOptions) => {
  const { disabled, canRevoke, onRevokeClick } = options ?? {};

  return ([
    columnHelper.display({
      size: 24,
      id: 'select',
      enableSorting: false,
      meta: {
        label: m['common.select'](),
        skeletonClassName: 'size-4.5 rounded-sm'
      },
      header: ({ table }) => (
        <div className="size-6 pr-2 flex items-center justify-center">
          <Checkbox
            disabled={disabled}
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="size-6 pr-2 flex items-center justify-center">
          <Checkbox
            disabled={disabled}
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
          />
        </div>
      )
    }),

    columnHelper.accessor('id', {
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ getValue }) => {
        const { isCopied, copyToClipboard } = useCopyToClipboard();
        const value = getValue();

        return (
          <div className="flex gap-1 items-center">
            <span className="text-xs font-mono">
              {value}
            </span>

            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              onClick={() => copyToClipboard(value)}
            >
              {isCopied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
            </Button>
          </div>
        );
      },
      meta: {
        label: 'Id',
        icon: IconHash,
        skeletonClassName: 'h-4 w-10',
        filter: { type: ColumnFilterType.Text }
      }
    }),

    columnHelper.accessor('userId', {
      size: 80,
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ getValue }) => {
        const { isCopied, copyToClipboard } = useCopyToClipboard();
        const value = getValue();

        return (
          <div className="flex gap-1 items-center">
            <span className="text-xs font-mono">
              {value}
            </span>

            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              onClick={() => copyToClipboard(value)}
            >
              {isCopied ? <IconCheck size={16}/> : <IconCopy size={16}/>}
            </Button>
          </div>
        );
      },
      meta: {
        label: m['pages.sessions.index.table.userId'](),
        icon: IconUser,
        skeletonClassName: 'h-4 w-10',
        filter: {
          type: ColumnFilterType.Text
        }
      }
    }),

    columnHelper.accessor('user', {
      size: 173,
      enableSorting: false,
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ getValue }) => {
        const value = getValue();
        if (!value)
          return null;

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs!">
                {pickFirstLetters(value.name, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-xs">
                {value.name}
              </span>

              <span className="text-xs text-muted-foreground">
                {value.email}
              </span>
            </div>
          </div>
        );
      },
      meta: {
        label: m['pages.sessions.index.table.user'](),
        icon: IconUserCircle,
        skeletonItem:
          <div className="flex gap-2">
            <Skeleton className="size-7 rounded-full"/>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-3 w-12"/>
              <Skeleton className="h-3 w-32"/>
            </div>
          </div>
      }
    }),

    columnHelper.accessor('userAgent', {
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const ua = getValue();
        if (!ua)
          return '—';

        const { os, browser, device } = UAParser(getValue() ?? '');
        const isMobile = device.type === 'mobile';
        const DeviceIcon = isMobile ? IconDeviceMobile : IconDeviceLaptop;
        const BrowserIcon = getBrowserIcon(browser.name);

        return (
          <div className="flex items-center gap-2 text-xs">
            <div className="leading-tight">
              <div className="flex gap-1 items-center">
                <BrowserIcon className="size-3 text-muted-foreground"/>
                <div>
                  {browser.name ?? 'Unknown'}{' '}
                  {browser.version?.split('.')[0]}
                </div>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <DeviceIcon className="size-3"/>
                <span>{os.name}</span>
              </div>
            </div>
          </div>
        );
      },
      meta: {
        label: m['pages.sessions.index.table.agent'](),
        icon: IconDeviceLaptop,
        skeletonItem:
          <div className="space-y-1">
            <div className="flex gap-1">
              <Skeleton className="size-3"/>
              <Skeleton className="h-3 w-full max-w-16"/>
            </div>
            <div className="flex gap-1">
              <Skeleton className="size-3"/>
              <Skeleton className="h-3 w-full max-w-10"/>
            </div>
          </div>
      }
    }),

    columnHelper.accessor('ipAddress', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}/>
      ),
      cell: ({ getValue }) => (
        <span className="text-xs">
          {getValue() ?? '—'}
        </span>
      ),
      meta: {
        label: m['pages.sessions.index.table.ipAddress'](),
        icon: IconWorld,
        skeletonClassName: 'h-4 w-28'
      }
    }),

    columnHelper.accessor('createdAt', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}/>
      ),
      cell: ({ getValue }) => (
        <span className="text-xs">
          {format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}
        </span>
      ),
      meta: {
        label: m['common.created'](),
        icon: IconCalendar,
        filter: { type: ColumnFilterType.DateRange },
        skeletonClassName: 'h-4 w-32'
      }
    }),

    columnHelper.accessor('updatedAt', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}/>
      ),
      cell: ({ getValue }) => (
        <span className="text-xs">
          {format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}
        </span>
      ),
      meta: {
        label: m['common.updated'](),
        icon: IconCalendar,
        filter: { type: ColumnFilterType.DateRange },
        skeletonClassName: 'h-4 w-32'
      }
    }),

    columnHelper.accessor('expiresAt', {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}/>
      ),
      cell: ({ getValue }) => (
        <span className="text-xs">
          {format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}
        </span>
      ),
      meta: {
        label: m['common.expires'](),
        icon: IconClock,
        filter: { type: ColumnFilterType.DateRange },
        skeletonClassName: 'h-4 w-32'
      }
    }),

    columnHelper.display({
      id: 'type',
      size: 87,
      enableSorting: false,
      meta: {
        icon: IconInfoCircle,
        label: m['pages.sessions.index.table.type'](),
        skeletonClassName: 'h-5.5 w-20 rounded-sm'
      },
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ row }) => {
        const { isCurrent, isOwned } = row.original;

        return (
          <Badge
            variant={isOwned ? (isCurrent ? 'outline' : 'secondary') : 'outline'}
            className={cn('rounded-sm min-h-6', (!isCurrent && isOwned) && 'border border-border')}
          >
            {isOwned ? (isCurrent ? (<IconSquareCheck size={16}/>) : (<IconSquareMinus size={16}/>)) : (
              <IconSquare size={16}/>)}
            <span>
              {isOwned ? (
                isCurrent ? m['pages.sessions.index.table.current']() : m['pages.sessions.index.table.other']()
              ) : (
                m['pages.sessions.index.table.external']()
              )}
            </span>
          </Badge>
        );
      }
    }),

    columnHelper.accessor('status', {
      size: 100,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const isExpired = getValue() === SessionState.Expired;

        return (
          <Badge
            variant={isExpired ? 'outline-destructive' : 'outline'}
            className={cn('rounded-sm min-h-6', !isExpired && 'border border-border')}
          >
            {isExpired ? <IconClock size={16}/> : <IconCheck size={16}/>}
            <span>{isExpired ? m['pages.sessions.index.table.expired']() : m['pages.sessions.index.table.valid']()}</span>
          </Badge>
        );
      },
      meta: {
        key: 'status',
        icon: IconClock,
        label: m['pages.sessions.index.table.status'](),
        skeletonClassName: 'h-5.5 w-20 rounded-sm',
        filter: {
          type: ColumnFilterType.MultiSelect,
          options: [
            { title: m['pages.sessions.index.table.active'](), value: SessionState.Active, icon: IconCheck },
            { title: m['pages.sessions.index.table.expired'](), value: SessionState.Expired, icon: IconClock },
          ]
        }
      }
    }),

    // Actions
    columnHelper.display({
      id: 'actions',
      size: 40,
      meta: {
        label: 'Actions',
        skeletonClassName: 'size-6 ml-auto'
      },
      cell: ({ row }) => {

        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon-xs" variant="ghost">
                  <IconDots size={16}/>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent  align="end">
                <DropdownMenuLabel>
                  {m['common.actions']()}
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>

                <DropdownMenuItem asChild>
                  <Link to="/admin/users" search={{ id: row.original.userId }}>
                    <IconUserCircle className="mr-2 size-4"/>
                    <span>{m['pages.sessions.index.table.owner']()}</span>
                  </Link>
                </DropdownMenuItem>

                {(!!onRevokeClick && canRevoke) && (
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={disabled}
                    onClick={() => onRevokeClick?.(row.original.token)}
                  >
                    <IconTrash className="mr-2 size-4"/>
                    <span>{m['common.revoke']()}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    })
  ]);
};

function getBrowserIcon(name?: string) {
  switch (name?.toLowerCase()) {
    case 'chrome':
    case 'mobile chrome':
      return IconBrandChrome;
    case 'firefox':
    case 'mobile firefox':
      return IconBrandFirefox;
    case 'safari':
    case 'mobile safari':
      return IconBrandSafari;
    case 'edge':
      return IconBrandEdge;
    case 'opera':
    case 'mobile opera':
      return IconBrandOpera;
    default:
      return IconHelpCircle;
  }
}