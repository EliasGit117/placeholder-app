import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';
import { BannersTable } from './-components/banners-table';


export const Route = createFileRoute('/admin/banners/')({
  component: RouteComponent,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { banners: ['list'] });
    if (!canList)
      throw redirect({ to: '/', replace: true });

    const [canCreate, canUpdate, canDelete] = await Promise.all([
      roleHasPermission(user?.role, { banners: ['create'] }),
      roleHasPermission(user?.role, { banners: ['update'] }),
      roleHasPermission(user?.role, { banners: ['delete'] }),
    ]);
    return { canCreate, canUpdate, canDelete };
  },
  loader: async ({ context: { queryClient } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery(orpc.admin.banners.getAll.queryOptions())
    );
  },
});


function RouteComponent() {
  const { canCreate, canUpdate, canDelete } = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <BannersTable canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete}/>
    </div>
  );
}
