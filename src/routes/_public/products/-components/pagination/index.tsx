import type { FC } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Pagination,
  PaginationContent,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { IconSelector } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TSearchPublicProductsRequestDto } from '@/features/products/public/dtos/search-public-products.ts';

interface IProps {
  page: number;
  pageCount: number;
  search: TSearchPublicProductsRequestDto;
}

export const ProductsPagination: FC<IProps> = ({ page, pageCount, search }) => {
  const canPreviousPage = page > 1;
  const canNextPage = page < pageCount;

  return (
    <div className="flex flex-col-reverse items-center gap-2 sm:flex-row sm:gap-6">
      <PageLimitSelect value={search.limit ?? 8} search={search}/>

      <div className="flex-1"/>

      <p className="text-xs sm:text-sm">
        {m['common.page']()} {page} {m['common.of']().toLowerCase()} {pageCount > 0 ? pageCount : 1}
      </p>

      <Pagination className="mx-0 w-fit">
        <PaginationContent className="gap-2">
          <PaginationItem>
            <PaginationFirst
              to="/products"
              textHidden
              variant="outline"
              size="icon-sm"
              disabled={!canPreviousPage}
              className="transition-none"
              search={{ ...search, page: 1 }}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationPrevious
              to="/products"
              textHidden
              variant="outline"
              size="icon-sm"
              disabled={!canPreviousPage}
              className="transition-none"
              search={{ ...search, page: Math.max(1, page - 1) }}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationNext
              to="/products"
              textHidden
              variant="outline"
              size="icon-sm"
              disabled={!canNextPage}
              className="transition-none"
              search={{ ...search, page: Math.min(pageCount, page + 1) }}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLast
              to="/products"
              textHidden
              variant="outline"
              size="icon-sm"
              disabled={!canNextPage}
              className="transition-none"
              search={{ ...search, page: pageCount }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

interface IPageLimitSelectProps {
  value: number;
  search: TSearchPublicProductsRequestDto;
  variants?: number[];
}

const PageLimitSelect: FC<IPageLimitSelectProps> = ({ value, search, variants = [8, 16, 32, 64] }) => {
  const navigate = useNavigate({ from: '/products/' });

  const onValueChange = (limit: number) => void navigate({
    search: { ...search, limit, page: 1 },
    replace: true
  });

  return (
    <div className="flex flex-col-reverse items-center gap-2 sm:flex-row">
      <p className="text-xs sm:text-sm">{m['components.shop.items_per_page']()}</p>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="min-w-20">
            <span>{value.toString()}</span>
            <IconSelector className="ml-auto"/>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="min-w-[--radix-popper-anchor-width]">
          {variants.map((limit) => (
            <DropdownMenuItem key={limit} onSelect={() => onValueChange(limit)}>
              {limit}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
