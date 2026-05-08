import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layout/admin';

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
  beforeLoad: ({ context: { user } }) => {
    if (!user)
      throw redirect({ to: '/', replace: true })
  },
})


function RouteComponent() {

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  )
}