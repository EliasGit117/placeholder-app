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
  IconCalendar,
  IconDots,
  IconEye,
  IconEyeOff,
  IconExternalLink,
  IconHash,
  IconLink,
  IconPencil,
  IconTrash,
  IconActivityHeartbeat,
  IconTextSize
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import { GallerySectionState } from '~/prisma/generated/prisma/enums.ts';
import { useGallerySectionSheet, GallerySectionSheetMode } from '../gallery-section-sheet/provider.tsx';
import type { TGallerySectionDto } from '@/features/gallery-sections/dtos/gallery-section.ts';


interface IOptions {
  disabled?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onDelete?: (id: number) => void;
}

const columnHelper = createColumnHelper<TGallerySectionDto>();

export const gallerySectionColumns = (options?: IOptions) => {
  const { disabled, canUpdate, canDelete, onDelete } = options ?? {};

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
      cell: ({ getValue, row }) => {
        const value = getValue();

        return (
          <Link
            className="text-xs underline underline-offset-2"
            to='/admin/gallery/sections/$sectionId'
            params={{ sectionId: row.original.id }}
          >
            {value}
          </Link>
        )
      },
      meta: {
        label: m['pages.gallery_sections.index.table.name_ro'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
        filter: { type: ColumnFilterType.Text },
      },
    }),

    columnHelper.accessor('nameRu', {
      size: 200,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue, row }) => {
        const value = getValue();

        return (
          <Link
            to='/admin/gallery/sections/$sectionId'
            params={{ sectionId: row.original.id }}
            className="text-xs underline underline-offset-2"
          >
            {value}
          </Link>
        )
      },
      meta: {
        label: m['pages.gallery_sections.index.table.name_ru'](),
        icon: IconTextSize,
        skeletonClassName: 'h-4 w-32',
      },
    }),

    columnHelper.accessor('slug', {
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => (
        <span className="text-xs text-muted-foreground">{getValue()}</span>
      ),
      meta: {
        label: m['pages.gallery_sections.index.table.slug'](),
        icon: IconLink,
        skeletonClassName: 'h-4 w-32',
      },
    }),

    columnHelper.accessor('state', {
      size: 120,
      enableSorting: false,
      header: ({ column }) => <DataTableColumnHeader column={column}/>,
      cell: ({ getValue }) => {
        const state = getValue();
        const isActive = state === GallerySectionState.active;

        return (
          <Badge
            variant={isActive ? 'outline' : 'secondary'}
            className="rounded-sm min-h-6"
          >
            {isActive ? <IconEye size={12}/> : <IconEyeOff size={12}/>}
            <span>
              {isActive
                ? m['pages.gallery_sections.index.table.state_active']()
                : m['pages.gallery_sections.index.table.state_hidden']()}
            </span>
          </Badge>
        );
      },
      meta: {
        icon: IconActivityHeartbeat,
        label: m['pages.gallery_sections.index.table.state'](),
        skeletonClassName: 'h-5.5 w-20 rounded-sm',
        filter: {
          type: ColumnFilterType.Select,
          options: [
            { title: m['pages.gallery_sections.index.table.state_active'](), value: GallerySectionState.active, icon: IconEye },
            { title: m['pages.gallery_sections.index.table.state_hidden'](), value: GallerySectionState.hidden, icon: IconEyeOff },
          ],
        },
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
        const { open } = useGallerySectionSheet();
        const section = row.original;

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
                  <Link to="/admin/gallery/sections/$sectionId" params={{ sectionId: section.id }}>
                    <IconExternalLink className="mr-2 size-4"/>
                    <span>{m['common.open']()}</span>
                  </Link>
                </DropdownMenuItem>

                {canUpdate && (
                  <DropdownMenuItem
                    onClick={() => open({ mode: GallerySectionSheetMode.Update, sectionId: section.id })}
                  >
                    <IconPencil className="mr-2 size-4"/>
                    <span>{m['common.edit']()}</span>
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete?.(section.id)}>
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
