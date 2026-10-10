import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';
import { searchBrandsRequestDtoSchema } from '@/features/brands/admin/dtos/search-brands.ts';
import { BrandsTable } from './-components/brands-table';


export const Route = createFileRoute('/admin/brands/')({
  component: RouteComponent,
  validateSearch: searchBrandsRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { brands: ['list'] });
    if (!canList)
      throw redirect({ to: '/', replace: true });

    const [canCreate, canUpdate, canDelete] = await Promise.all([
      roleHasPermission(user?.role, { brands: ['create'] }),
      roleHasPermission(user?.role, { brands: ['update'] }),
      roleHasPermission(user?.role, { brands: ['delete'] }),
    ]);
    return { canCreate, canUpdate, canDelete };
  },
  loaderDeps: (deps) => deps,
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery(orpc.admin.brands.search.queryOptions({ input: search }))
    );
  },
});


function RouteComponent() {
  const search = Route.useSearch();
  const { canCreate, canUpdate, canDelete } = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <BrandsTable search={search} canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete}/>
    </div>
  );
}
