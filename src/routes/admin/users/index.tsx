import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { UsersTable } from '@/routes/admin/users/-components/users-table';
import { m } from '@/paraglide/messages';
import { searchUsersRequestDtoSchema } from '@/features/users/admin/dtos/search-users.ts';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';


export const Route = createFileRoute('/admin/users/')({
  staticData: { crumbs: { title: () => m['pages.users.title']() } },
  component: RouteComponent,
  validateSearch: searchUsersRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { user: ['list'] });
    if (canList) {
      const [canCreate, canUpdate] = await Promise.all([
        roleHasPermission(user?.role, { user: ['create'] }),
        roleHasPermission(user?.role, { user: ['update'] }),
      ]);
      return { canCreate, canUpdate };
    }

    throw redirect({ to: '/', replace: true });
  },
  loaderDeps: (deps) => (deps),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery({ ...orpc.admin.users.search.queryOptions({ input: search }) })
    );
  }
});


function RouteComponent() {
  const search = Route.useSearch();
  const { canCreate, canUpdate } = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <UsersTable search={search} canCreate={canCreate} canUpdate={canUpdate}/>
    </div>
  );
}
