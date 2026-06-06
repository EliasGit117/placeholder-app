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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import {
  IconActivityHeartbeat,
  IconCalendar,
  IconDots,
  IconExternalLink,
  IconHash,
  IconLink,
  IconPhotoOff,
  IconStack2,
  IconTextSize,
  IconTrash,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { thumbhashToDataUrl } from '@/lib/utils';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import { getProductStateOption, productStateOptions } from '../product-editor';
import type { TProduct, TProductVariantBrief } from '@/features/products/schemas/product.ts';


interface IOptions {
  disabled?: boolean;
  canDelete?: boolean;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<TProduct>();

export const productColumns = (options?: IOptions) => {
  const { disabled, canDelete, onDelete } = options ?? {};

  return ([
    columnHelper.display({
      size: 24,
      id: 'select',
      enableSorting: false,
      meta: {
        label: m['common.select'](),
        skeletonClassName: 'size-4.5 rounded-sm',
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
      ),
    }),

    columnHelper.accessor('id', {
      size: 80,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground tabular-nums">{getValue()}</span>
      ),
      meta: {
        label: m['common.id'](),
        icon: IconHash,
        skeletonClassName: 'h-4 w-10',
      },
    }),

    columnHelper.accessor('nameRo', {
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => (
        <Link
          className="text-xs underline underline-offset-2"
          to="/admin/products/$productId"
          params={{ productId: row.original.id }}
        >
          {getValue()}
        </Link>
      ),
      meta: {
        label: m['pages.products.index.table.name_ro'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text },
      },
    }),

    columnHelper.accessor('nameRu', {
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => (
        <Link
          className="text-xs underline underline-offset-2"
          to="/admin/products/$productId"
          params={{ productId: row.original.id }}
        >
          {getValue()}
        </Link>
      ),
      meta: {
        label: m['pages.products.index.table.name_ru'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text },
      },
    }),

    columnHelper.accessor('slug', {
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
      meta: {
        label: m['pages.products.index.table.slug'](),
        icon: IconLink,
        skeletonClassName: 'h-4 w-32',
      },
    }),

    columnHelper.accessor('state', {
      size: 120,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const option = getProductStateOption(getValue());
        const Icon = option.icon;
        return (
          <Badge variant={getValue() === ProductState.active ? 'outline' : 'secondary'} className="rounded-sm min-h-6">
            <Icon size={12}/>
            <span>{option.label()}</span>
          </Badge>
        );
      },
      meta: {
        icon: IconActivityHeartbeat,
        label: m['pages.products.index.table.state'](),
        skeletonClassName: 'h-5.5 w-20 rounded-sm',
        filter: {
          type: ColumnFilterType.MultiSelect,
          options: productStateOptions.map(({ value, label, icon }) => ({ title: label(), value, icon })),
        },
      },
    }),

    columnHelper.accessor('variants', {
      size: 240,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => <VariantsCell variants={getValue()}/>,
      meta: {
        label: m['pages.products.index.table.variants'](),
        icon: IconStack2,
        skeletonClassName: 'h-6.5 w-40',
      },
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
        filter: { type: ColumnFilterType.DateRange },
      },
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
        filter: { type: ColumnFilterType.DateRange },
      },
    }),

    columnHelper.display({
      id: 'actions',
      size: 40,
      meta: {
        label: m['common.actions'](),
        skeletonClassName: 'size-6 ml-auto',
      },
      cell: ({ row }) => {
        const product = row.original;
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
                  <Link to="/admin/products/$productId" params={{ productId: product.id }}>
                    <IconExternalLink className="mr-2 size-4"/>
                    <span>{m['common.open']()}</span>
                  </Link>
                </DropdownMenuItem>

                {canDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(product.id)}>
                    <IconTrash className="mr-2 size-4"/>
                    <span>{m['common.delete']()}</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ]);
};


const MAX_VARIANTS = 3;

function VariantsCell({ variants }: { variants: TProductVariantBrief[] }) {
  const isRu = getLocale() === 'ru';

  if (variants.length === 0)
    return <span className="text-xs text-muted-foreground">—</span>;

  const shown = variants.slice(0, MAX_VARIANTS);
  const extra = variants.length - shown.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {shown.map((variant) => {
        const placeholder = thumbhashToDataUrl(variant.thumbhash);
        return (
          <Badge key={variant.id} variant="outline" className="rounded-sm max-w-36 px-1 min-h-6">
            {variant.imageUrl ? (
              <span
                className="size-4 shrink-0 overflow-hidden rounded-xs bg-muted bg-cover bg-center"
                style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
              >
                <img src={variant.imageUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover"/>
              </span>
            ) : (
              <span className="flex size-4 shrink-0 items-center justify-center rounded-xs bg-muted text-muted-foreground">
                <IconPhotoOff className="size-2.5"/>
              </span>
            )}
            <span className="truncate">{isRu ? variant.nameRu : variant.nameRo}</span>
          </Badge>
        );
      })}
      {extra > 0 && <span className="text-xs text-muted-foreground">+{extra}</span>}
    </div>
  );
}
