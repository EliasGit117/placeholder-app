import { useDataTableContext } from '@/components/data-table/context';
import type { VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Pagination,
  PaginationItem,
  PaginationContent,
  PaginationFirst,
  PaginationLast,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { useNavigate } from '@tanstack/react-router';
import { type ComponentProps } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { IconSelector } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';



interface IDataTablePaginationProps<_> extends ComponentProps<'div'> {
  pageSizeOptions?: Array<number>;
  resetScroll?: boolean;
  buttonsSize?: VariantProps<typeof buttonVariants>['size'];
}


export function DataTablePagination<TData>(props: IDataTablePaginationProps<TData>) {
  // noinspection BadExpressionStatementJS
  "use no memo";

  const { table } = useDataTableContext();
  const { resetScroll, className, buttonsSize = 'icon-sm', ...restOfProps } = props;

  const page = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const size = table.getState().pagination.pageSize;
  const canPreviousPage = table.getCanPreviousPage();
  const canNextPage = table.getCanNextPage();

  return (
    <div
      className={cn(cn('flex flex-col-reverse sm:flex-row gap-2 sm:gap-6 items-center', className))}
      {...restOfProps}
    >
      <PageLimitSelect value={size} buttonSize="sm"/>

      <div className="flex-1"/>

      <p className="text-xs sm:text-sm">
        {m['common.page']()} {page} {m['common.of']().toLowerCase()} {totalPages > 0 ? totalPages : 1}
      </p>

      <Pagination className="w-fit mx-0">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationFirst
              to="."
              textHidden
              variant="outline"
              size={buttonsSize}
              disabled={!canPreviousPage}
              resetScroll={resetScroll}
              className="transition-none"
              search={(pv) => ({ ...pv, page: 1 })}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              to="."
              textHidden
              variant="outline"
              size={buttonsSize}
              disabled={!canPreviousPage}
              resetScroll={resetScroll}
              className="transition-none"
              search={(pv) => ({ ...pv, page: page - 1 })}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              to="."
              textHidden
              variant="outline"
              size={buttonsSize}
              disabled={!canNextPage}
              resetScroll={resetScroll}
              className="transition-none"
              search={(pv) => ({ ...pv, page: page + 1 })}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLast
              to="."
              textHidden
              variant="outline"
              size={buttonsSize}
              disabled={!canNextPage}
              resetScroll={resetScroll}
              className="transition-none"
              search={(pv) => ({ ...pv, page: totalPages })}
            />
          </PaginationItem>

        </PaginationContent>
      </Pagination>
    </div>
  );
}

interface IPageLimitSelectProps {
  value: number;
  className?: string;
  variants?: number[];
  hideText?: boolean;
  buttonSize?: 'default' | 'sm';
}

function PageLimitSelect(props: IPageLimitSelectProps) {
  const navigate = useNavigate();
  const { value, className, hideText, buttonSize = 'default', variants = [10, 25, 50, 100] } = props;

  const _onValueChange = (value: number) => void navigate({
    to: '.',
    resetScroll: false,
    search: (pv) => ({ ...pv, limit: value, page: 1 })
  });

  return (
    <div className={cn('flex flex-col-reverse sm:flex-row gap-2 items-center', className)}>
      {!hideText && <p className="text-xs sm:text-sm">{m['components.data_table.rows_per_page']()}</p>}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={cn('min-w-20', buttonSize === 'default' ? 'max-h-9' : 'max-h-8')}>
            <span>{value.toString()}</span>
            <IconSelector className="ml-auto"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[--radix-popper-anchor-width]"
        >
          {variants.map(page => (
            <DropdownMenuItem key={page} onSelect={() => _onValueChange(page)}>
              {page}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default DataTablePagination;