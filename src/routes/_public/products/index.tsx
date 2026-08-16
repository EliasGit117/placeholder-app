import { type FC, useEffect, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { Skeleton } from '@/components/ui/skeleton';
import { searchPublicProductsRequestDtoSchema } from '@/features/products/public/dtos/search-public-products.ts';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { IconSearchOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { ProductCard } from '@/components/product/card.tsx';
import { ProductSearchPanel } from '@/routes/_public/products/-components/search';
import { MobileSearchSheet } from '@/routes/_public/products/-components/search/mobile-search-sheet.tsx';
import { SortSelect } from '@/routes/_public/products/-components/search/sort-select.tsx';
import { ProductsPagination } from '@/routes/_public/products/-components/pagination';
import type { IBreadcrumb } from '@/components/layout/common/breadcrumbs';


export const Route = createFileRoute('/_public/products/')({
  component: RouteComponent,
  pendingComponent: ProductsPending,
  validateSearch: searchPublicProductsRequestDtoSchema,
  loaderDeps: (deps) => deps,
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    const [_, category] = await Promise.all([
      queryClient.ensureQueryData(orpc.products.search.queryOptions({ input: search })),
      search.categoryId != null ?
        queryClient.ensureQueryData(orpc.categories.getById.queryOptions({ input: { id: search.categoryId } })) :
        Promise.resolve(null)
    ]);

    const crumbs: IBreadcrumb[] = [{ title: m['components.header.products'](), link: { to: '/products' } }];
    if (category) {
      for (const ancestor of category.ancestors)
        crumbs.push({ title: ancestor.name, link: { to: '/products', search: { categoryId: ancestor.id } } });

      crumbs.push({ title: category.name });
    }

    return { crumbs };
  }
});


function RouteComponent() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [term, setTerm] = useState(search.name ?? '');

  useEffect(() => {
    setTerm(search.name ?? '');
  }, [search.name]);

  useEffect(() => {
    const next = term.trim() || undefined;

    if (next === (search.name ?? undefined)) {
      return;
    }

    const timer = setTimeout(() => {
      void navigate({
        search: (prev) => ({
          ...prev,
          name: next,
          page: 1
        }),
        replace: true
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [term, navigate, search]);

  const { data } = useSuspenseQuery(orpc.products.search.queryOptions({ input: search }));
  const products = data.items;
  const pageCount = data.pageCount;
  const page = search.page ?? 1;

  return (
    <main className="flex flex-col flex-1 bg-background min-h-safe-screen">
      <div className="container mx-auto flex flex-1 flex-col gap-4 p-4">

        <div className="flex items-center gap-2 lg:hidden">
          <MobileSearchSheet/>
          <SortSelect showLabel={false} className="flex-1 space-y-0"/>
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          <aside className="hidden shrink-0 lg:block lg:w-64">
            <ProductSearchPanel className="lg:sticky lg:top-20"/>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <section aria-label="Products" className="flex flex-1 flex-col">
              {products.length === 0 ? (
                <Empty className="rounded-xl border border-dashed py-24 h-full">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <IconSearchOff/>
                    </EmptyMedia>
                    <EmptyTitle>{m['components.shop.empty_title']()}</EmptyTitle>
                    <EmptyDescription>{m['components.shop.empty_description']()}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <ul className="grid gap-4 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {products.map((product) => (
                    <li key={product.id} className="contents">
                      <ProductCard product={product}/>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <nav aria-label="Product pagination" className="mt-10">
              <ProductsPagination
                page={page}
                pageCount={pageCount}
                search={search}
              />
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}

function ProductsPending() {
  const search = Route.useSearch();

  return (
    <main className="flex flex-col flex-1 bg-background min-h-safe-screen">
      <div className="container mx-auto flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-center gap-2 lg:hidden">
          <MobileSearchSheet/>
          <SortSelect showLabel={false} className="flex-1 space-y-0"/>
        </div>

        <div className="flex flex-1 flex-col gap-6 lg:flex-row">
          <aside className="hidden shrink-0 lg:block lg:w-64">
            <ProductSearchPanel className="lg:sticky lg:top-20"/>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <ProductGridSkeleton count={search.limit ?? 8}/>
          </div>
        </div>
      </div>
    </main>
  );
}

const ProductGridSkeleton: FC<{ count: number }> = ({ count }) => (
  <div
    className="grid gap-4 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="overflow-hidden rounded-xl border border-border"
      >
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
