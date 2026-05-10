import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ColumnFilterType, DataTableColumnHeader } from '@/components/data-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button.tsx';
import {
  IconAt,
  IconBan,
  IconCalendar,
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconDots,
  IconHash,
  IconId,
  IconKey,
  IconMailCheck,
  IconMailX,
  IconPencil,
  IconUser,
  IconUserCheck,
  IconUserCircle,
  IconUserX
} from '@tabler/icons-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { cn, pickFirstLetters } from '@/lib/utils';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard.ts';
import { m } from '@/paraglide/messages';
import type { TUserBriefDto } from '@/features/users/schemas/user-brief.ts';
import { Link } from '@tanstack/react-router';
import { useUserSheet, UserSheetMode } from '@/routes/admin/users/-components/user-sheet/provider.tsx';


interface IOptions {
  disabled?: boolean;
  canUpdate?: boolean;
}


const columnHelper = createColumnHelper<TUserBriefDto>();

export const userColumns = (options?: IOptions) => {
  const { disabled, canUpdate } = options ?? {};

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
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const { isCopied, copyToClipboard } = useCopyToClipboard();
        const value = getValue();

        return (
          <div className="flex gap-1 items-center">
            <span className="text-xs font-mono">{value}</span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              onClick={() => copyToClipboard(value)}
            >
              {isCopied ? <IconCheck/> : <IconCopy/>}
            </Button>
          </div>
        );
      },
      meta: {
        label: 'Id',
        icon: IconHash,
        skeletonClassName: 'h-4 w-24',
        filter: { type: ColumnFilterType.Text }
      }
    }),

    columnHelper.accessor('name', {
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const name = getValue();

        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-7">
              <AvatarFallback className="text-xs!">
                {pickFirstLetters(name, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{name}</span>
          </div>
        );
      },
      meta: {
        label: m['pages.users.index.table.name'](),
        icon: IconUser,
        skeletonClassName: 'h-4 w-28',
        filter: { type: ColumnFilterType.Text }
      }
    }),

    columnHelper.accessor('email', {
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs">{getValue()}</span>
      ),
      meta: {
        label: m['common.email'](),
        icon: IconAt,
        skeletonClassName: 'h-4 w-36',
        filter: { type: ColumnFilterType.Text }
      }
    }),

    columnHelper.accessor('role', {
      size: 100,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const role = getValue();
        if (!role)
          return <span className="text-xs text-muted-foreground">—</span>;

        let roleName = role;
        if (role === 'admin')
          roleName = m['enums.user_role.admin']();
        else if (role === 'user')
          roleName = m['enums.user_role.user']();

        return (
          <Badge variant="secondary" className="rounded-sm text-xs capitalize">
            {roleName}
          </Badge>
        );
      },
      meta: {
        label: m['pages.users.index.table.role'](),
        icon: IconId,
        skeletonClassName: 'h-5.5 w-16 rounded-sm',
        filter: {
          type: ColumnFilterType.MultiSelect,
          options: [
            { title: 'Admin', value: 'admin' },
            { title: 'User', value: 'user' }
          ]
        }
      }
    }),

    columnHelper.accessor('emailVerified', {
      size: 120,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const verified = getValue();

        return (
          <Badge
            variant={verified ? 'outline' : 'secondary'}
            className={cn('rounded-sm min-h-6', verified && 'border border-border')}
          >
            {verified ? <IconMailCheck/> : <IconMailX/>}
            <span>{verified ? m['pages.users.index.table.verified']() : m['pages.users.index.table.unverified']()}</span>
          </Badge>
        );
      },
      meta: {
        label: m['pages.users.index.table.emailVerified'](),
        icon: IconCircleCheck,
        skeletonClassName: 'h-5.5 w-24 rounded-sm'
      }
    }),

    columnHelper.accessor('banned', {
      size: 100,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const banned = getValue();

        return (
          <Badge
            variant={banned ? 'destructive' : 'outline'}
            className={cn('rounded-sm min-h-6', !banned && 'border border-border')}
          >
            {banned ? <IconUserX/> : <IconUserCheck/>}
            <span>{banned ? m['pages.users.index.table.banned']() : m['pages.users.index.table.active']()}</span>
          </Badge>
        );
      },
      meta: {
        label: m['common.status'](),
        icon: IconUserCircle,
        skeletonClassName: 'h-5.5 w-20 rounded-sm',
        filter: {
          type: ColumnFilterType.Select,
          options: [
            { title: m['pages.users.index.table.active'](), value: false, icon: IconUserCheck },
            { title: m['pages.users.index.table.banned'](), value: true, icon: IconBan }
          ]
        }
      }
    }),

    columnHelper.accessor('banReason', {
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue() ?? '—'}</span>
      ),
      meta: {
        label: m['pages.users.index.table.banReason'](),
        icon: IconBan,
        skeletonClassName: 'h-4 w-24'
      }
    }),

    columnHelper.accessor('createdAt', {
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs">{format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}</span>
      ),
      meta: {
        label: m['common.created'](),
        icon: IconCalendar,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.DateRange }
      }
    }),

    columnHelper.accessor('updatedAt', {
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs">{format(new Date(getValue()), 'dd.MM.yyyy - HH:mm')}</span>
      ),
      meta: {
        label: m['common.updated'](),
        icon: IconCalendar,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.DateRange }
      }
    }),

    // Actions
    columnHelper.display({
      id: 'actions',
      size: 40,
      meta: {
        label: m['common.actions'](),
        skeletonClassName: 'size-6 ml-auto'
      },
      cell: ({ row }) => {
        const { open } = useUserSheet();

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

                {canUpdate && (
                  <DropdownMenuItem onClick={() => open({ mode: UserSheetMode.Update, userId: row.original.id })}>
                    <IconPencil className="mr-2 size-4"/>
                    <span>{m['common.edit']()}</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link to="/admin/sessions" search={{ userId: row.original.id }}>
                    <IconKey className="mr-2 size-4"/>
                    <span>{m['pages.users.index.table.sessions']()}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }
    })
  ]);
};
