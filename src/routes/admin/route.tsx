import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layout/admin';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin')({
  component: RouteComponent,
  beforeLoad: ({ context: { user } }) => {
    if (!user)
      throw redirect({ to: '/', replace: true })
  },
  staticData: { crumbs: { title: () => m['common.admin']() } },
})


function RouteComponent() {

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}