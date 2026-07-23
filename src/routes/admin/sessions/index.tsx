import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { SessionsTable } from '@/routes/admin/sessions/-components/sessions-table';
import { m } from '@/paraglide/messages';
import { searchSessionsRequestDtoSchema } from '@/features/sessions/common/dtos/search-sessions.ts';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';


export const Route = createFileRoute('/admin/sessions/')({
  staticData: { crumbs: { title: () => m['pages.sessions.title']() } },
  component: RouteComponent,
  validateSearch: searchSessionsRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canListSessions = await roleHasPermission(user?.role, { session: ['list'] });
    const canListUsers = await roleHasPermission(user?.role, { user: ['list'] });
    const canRevokeSessions = await roleHasPermission(user?.role, { session: ['revoke'] });
    if (canListUsers && canListSessions)
      return { canRevoke: canRevokeSessions };

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
  const { canRevoke } = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <SessionsTable search={search} canRevoke={canRevoke}/>
    </div>
  );
}
