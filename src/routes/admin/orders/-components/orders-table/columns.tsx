import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Link } from '@tanstack/react-router';
import { ColumnFilterType, DataTableColumnHeader } from '@/components/data-table';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  IconBuildingStore,
  IconCalendar,
  IconDots,
  IconEye,
  IconHash,
  IconInfoCircle,
  IconTruckDelivery,
  IconUser
} from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { DeliveryMethod } from '~/prisma/generated/prisma/enums.ts';
import type { TOrderDto } from '@/features/orders/common/dtos/order.ts';
import { getOrderStatusOption, orderStatusOptions } from '../order-status.ts';


interface IOptions {
  disabled?: boolean;
}

const columnHelper = createColumnHelper<TOrderDto>();

export const orderColumns = (options?: IOptions) => {
  const { disabled } = options ?? {};

  return ([
    columnHelper.display({
      size: 24,
      id: 'select',
      enableSorting: false,
      meta: {
        label: m['common.select'](),
        skeletonClassName: 'size-4 rounded-sm'
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

    columnHelper.accessor('uid', {
      enableSorting: false,
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ getValue }) => (
        <span className="text-xs font-mono">{getValue().slice(0, 8)}</span>
      ),
      meta: {
        label: m['pages.orders.index.table.uid'](),
        icon: IconHash,
        skeletonClassName: 'h-4 w-16'
      }
    }),

    columnHelper.display({
      id: 'customer',
      enableSorting: false,
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ row }) => {
        const { fullName, phone, email } = row.original;

        return (
          <div className="flex flex-col">
            <span className="text-xs">{fullName}</span>
            <span className="text-xs text-muted-foreground">{phone}</span>
            <span className="text-xs text-muted-foreground">{email}</span>
          </div>
        );
      },
      meta: {
        label: m['pages.orders.index.table.customer'](),
        icon: IconUser,
        skeletonClassName: 'h-9 w-32'
      }
    }),

    columnHelper.accessor('status', {
      size: 100,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const option = getOrderStatusOption(getValue());
        const Icon = option.icon;

        return (
          <Badge variant="outline" className="rounded-sm min-h-6 border border-border">
            <Icon size={16}/>
            <span>{option.label()}</span>
          </Badge>
        );
      },
      meta: {
        key: 'status',
        icon: IconInfoCircle,
        label: m['pages.orders.index.table.status'](),
        skeletonClassName: 'h-5.5 w-20 rounded-sm',
        filter: {
          type: ColumnFilterType.MultiSelect,
          options: orderStatusOptions.map(({ value, label, icon }) => ({ title: label(), value, icon }))
        }
      }
    }),

    columnHelper.accessor('totalPrice', {
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ getValue }) => (
        <span className="text-xs">
          {getValue()} {m['components.shop.currency']()}
        </span>
      ),
      meta: {
        label: m['pages.orders.index.table.total'](),
        skeletonClassName: 'h-4 w-16'
      }
    }),

    columnHelper.display({
      id: 'items',
      enableSorting: false,
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ row }) => (
        <span className="text-xs">{row.original.items.reduce((sum, i) => sum + i.count, 0)}</span>
      ),
      meta: {
        label: m['pages.orders.index.table.items'](),
        skeletonClassName: 'h-4 w-8'
      }
    }),

    columnHelper.accessor('deliveryMethod', {
      enableSorting: false,
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
      cell: ({ getValue }) => {
        const isPickup = getValue() === DeliveryMethod.PICKUP;
        const Icon = isPickup ? IconBuildingStore : IconTruckDelivery;

        return (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon size={14}/>
            <span>
              {isPickup ? m['pages.checkout.payment.delivery_pickup']() : m['pages.checkout.payment.delivery_courier']()}
            </span>
          </div>
        );
      },
      meta: {
        label: m['pages.orders.index.table.deliveryMethod'](),
        skeletonClassName: 'h-4 w-24'
      }
    }),

    columnHelper.accessor('createdAt', {
      header: ({ column }) => (<DataTableColumnHeader column={column}/>),
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

    // Actions
    columnHelper.display({
      id: 'actions',
      size: 40,
      meta: {
        label: 'Actions',
        skeletonClassName: 'size-6 ml-auto'
      },
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon-xs" variant="ghost">
                <IconDots size={16}/>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {m['common.actions']()}
              </DropdownMenuLabel>
              <DropdownMenuSeparator/>

              <DropdownMenuItem asChild>
                <Link to="/admin/orders/$orderId" params={{ orderId: row.original.id }}>
                  <IconEye className="mr-2 size-4"/>
                  <span>{m['common.open']()}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    })
  ]);
};
