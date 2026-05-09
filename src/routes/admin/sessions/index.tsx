import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { SessionsTable } from '@/routes/admin/sessions/-components/sessions-table';
import { searchSessionsRequestDtoSchema } from '@/features/sessions/schemas/search-sessions.ts';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';


export const Route = createFileRoute('/admin/sessions/')({
  component: RouteComponent,
  validateSearch: searchSessionsRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canListSessions = await roleHasPermission(user?.role, { session: ['list'] });
    const canListUsers = await roleHasPermission(user?.role, { user: ['list'] });
    if (canListUsers && canListSessions)
      return;

    throw redirect({ to: '/', replace: true });
  },
  loaderDeps: (deps) => (deps),
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery({ ...orpc.admin.sessions.search.queryOptions({ input: search }) })
    );

  }
});


function RouteComponent() {
  const search = Route.useSearch();

  return (
    <div className="container mx-auto p-4 space-y-4">
      <SessionsTable search={search}/>
    </div>
  );
}
