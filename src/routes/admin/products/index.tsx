import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { ProductsTable } from './-components/products-table';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';
import { searchProductsRequestDtoSchema } from '@/features/products/admin/dtos/search-products.ts';


export const Route = createFileRoute('/admin/products/')({
  component: RouteComponent,
  validateSearch: searchProductsRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { products: ['list'] });
    if (!canList)
      throw redirect({ to: '/', replace: true });

    const [canCreate, canDelete] = await Promise.all([
      roleHasPermission(user?.role, { products: ['create'] }),
      roleHasPermission(user?.role, { products: ['delete'] }),
    ]);
    return { canCreate, canDelete };
  },
  loaderDeps: (deps) => deps,
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery({
        ...orpc.admin.products.search.queryOptions({ input: search }),
      })
    );
  },
});


function RouteComponent() {
  const search = Route.useSearch();
  const { canCreate, canDelete } = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <ProductsTable search={search} canCreate={canCreate} canDelete={canDelete}/>
    </div>
  );
}
