import { type FC, useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { IconSearch } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { awaitIfServer } from '@/lib/server';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { SortDirection } from '@/features/shared/schemas/pagination.ts';
import {
  searchPublicProductsRequestDtoSchema,
  type TSearchPublicProductsRequestDto
} from '@/features/products/schemas/search-public-products.ts';
import { m } from '@/paraglide/messages';
import { ProductCard } from './-components/product-card.tsx';


export const Route = createFileRoute('/_public/products/')({
  component: RouteComponent,
  validateSearch: searchPublicProductsRequestDtoSchema,
  loaderDeps: (deps) => deps,
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(queryClient.prefetchQuery(orpc.products.search.queryOptions({ input: search })));
  }
});


const sortOptions = [
  { value: 'new', label: m['components.shop.sort_newest'], sort: 'createdAt', dir: SortDirection.DESC },
  { value: 'name-asc', label: m['components.shop.sort_name_asc'], sort: 'name', dir: SortDirection.ASC },
  { value: 'name-desc', label: m['components.shop.sort_name_desc'], sort: 'name', dir: SortDirection.DESC },
  { value: 'price-asc', label: m['components.shop.sort_price_asc'], sort: 'price', dir: SortDirection.ASC },
  { value: 'price-desc', label: m['components.shop.sort_price_desc'], sort: 'price', dir: SortDirection.DESC }
] as const;


function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [term, setTerm] = useState(search.name ?? '');
  useEffect(() => {
    setTerm(search.name ?? '');
  }, [search.name]);

  useEffect(() => {
    const next = term.trim() || undefined;
    if (next === (search.name ?? undefined))
      return;

    const timer = setTimeout(() => {
      navigate({
        search: (prev) => ({ ...prev, name: next, page: 1 }),
        replace: true
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [term, navigate, search]);

  const { data, isPending, isPlaceholderData } = useQuery({
    ...orpc.products.search.queryOptions({ input: search }),
    placeholderData: keepPreviousData
  });

  const products = data?.items ?? [];
  const pageCount = data?.pageCount ?? 0;
  const page = search.page ?? 1;

  const activeSort = sortOptions.find((o) => search.sort === o.sort && search.dir === o.dir)?.value ?? 'new';

  const onSortChange = (value: string) => {
    const opt = sortOptions.find((o) => o.value === value);
    if (!opt) return;
    navigate({
      search: (prev) => ({ ...prev, sort: opt.sort, dir: opt.dir, page: 1 }),
      replace: true
    });
  };

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-10">
        {/* Toolbar */}
        <div
          className="mb-6 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <IconSearch
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={m['components.shop.search_placeholder']()}
              className="pl-9"
            />
          </div>
          <Select value={activeSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className={cn('transition-opacity', isPlaceholderData && 'opacity-60')}>
          {isPending ? (
            <ProductGridSkeleton/>
          ) : products.length === 0 ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center">
              <p className="font-heading text-2xl">{m['components.shop.empty_title']()}</p>
              <p className="mt-2 text-sm text-muted-foreground">{m['components.shop.empty_description']()}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p}/>
              ))}
            </div>
          )}
        </div>

        <ProductsPagination page={page} pageCount={pageCount} search={search}/>
      </div>
    </div>
  );
}


const ProductGridSkeleton: FC = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-xl border border-border">
        <Skeleton className="aspect-[1/1.05] w-full rounded-none"/>
        <div className="space-y-3 p-5">
          <Skeleton className="h-6 w-2/3"/>
          <Skeleton className="h-4 w-full"/>
          <Skeleton className="h-9 w-full"/>
        </div>
      </div>
    ))}
  </div>
);


interface IPaginationProps {
  page: number;
  pageCount: number;
  search: TSearchPublicProductsRequestDto;
}

const ProductsPagination: FC<IPaginationProps> = ({ page, pageCount, search }) => {
  // Compact window of pages around the current one.
  const window = 2;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= window
  );

  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            to="/products"
            search={{ ...search, page: Math.max(1, page - 1) }}
            disabled={page <= 1}
          />
        </PaginationItem>

        {pages.map((p, i) => {
          const prev = pages[i - 1];
          const gap = prev != null && p - prev > 1;
          return (
            <PaginationItem key={p} className="flex items-center gap-1">
              {gap && <span className="px-1 text-muted-foreground">…</span>}
              <PaginationLink to="/products" search={{ ...search, page: p }} isActive={p === page}>
                {p}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationNext
            to="/products"
            search={{ ...search, page: Math.min(pageCount, page + 1) }}
            disabled={page >= pageCount}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
