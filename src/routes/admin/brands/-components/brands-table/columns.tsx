import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { IconCalendar, IconDots, IconEdit, IconHash, IconTextSize, IconTrash } from '@tabler/icons-react';
import { ColumnFilterType, DataTableColumnHeader } from '@/components/data-table';
import { Button } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { m } from '@/paraglide/messages';
import type { TBrandDto } from '@/features/brands/common/dtos/brand.ts';


interface IOptions {
  canUpdate?: boolean;
  canDelete?: boolean;
  onEdit?: (brand: TBrandDto) => void;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<TBrandDto>();

export const brandColumns = (options?: IOptions) => {
  const { canUpdate, canDelete, onEdit, onDelete } = options ?? {};

  const nameCell = (brand: TBrandDto, name: string) =>
    canUpdate ? (
      <button
        type="button"
        className="text-xs underline underline-offset-2 text-left"
        onClick={() => onEdit?.(brand)}
      >
        {name}
      </button>
    ) : (
      <span className="text-xs">{name}</span>
    );

  return [
    columnHelper.accessor('id', {
      size: 20,
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
      size: 240,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => nameCell(row.original, getValue()),
      meta: {
        label: m['pages.brands.index.table.name_ro'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text },
      },
    }),

    columnHelper.accessor('nameRu', {
      size: 240,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => nameCell(row.original, getValue()),
      meta: {
        label: m['pages.brands.index.table.name_ru'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text },
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
        const brand = row.original;

        if (!canUpdate && !canDelete)
          return null;

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
                  <DropdownMenuItem onClick={() => onEdit?.(brand)}>
                    <IconEdit className="mr-2 size-4"/>
                    <span>{m['common.edit']()}</span>
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(brand.id)}>
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
  ];
};
