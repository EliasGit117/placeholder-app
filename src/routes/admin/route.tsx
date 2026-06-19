import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layout/admin';
import { m } from '@/paraglide/messages';
import adminCss from '@/styles.admin.css?url';


export const Route = createFileRoute('/admin')({
  component: RouteComponent,
  beforeLoad: ({ context: { user } }) => {
    if (!user)
      throw redirect({ to: '/', replace: true })
  },
  head: () => ({
    links: [{ rel: 'stylesheet', href: adminCss }]
  }),
  staticData: { crumbs: { title: () => m['common.admin']() } },
})


function RouteComponent() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}
