import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { OrdersTable } from '@/routes/admin/orders/-components/orders-table';
import { searchOrdersRequestDtoSchema } from '@/features/orders/admin/dtos/search-orders.ts';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';


export const Route = createFileRoute('/admin/orders/')({
  component: RouteComponent,
  validateSearch: searchOrdersRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { orders: ['list'] });
    if (!canList)
      throw redirect({ to: '/', replace: true });

    const canUpdate = await roleHasPermission(user?.role, { orders: ['update'] });
    return { canUpdate };
  },
  loaderDeps: (deps) => (deps),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery({ ...orpc.admin.orders.search.queryOptions({ input: search }) })
    );
  }
});


function RouteComponent() {
  const search = Route.useSearch();

  return (
    <div className="space-y-4">
      <OrdersTable search={search}/>
    </div>
  );
}
