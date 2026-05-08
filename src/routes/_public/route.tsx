import { createFileRoute, Outlet } from '@tanstack/react-router';
import { MainLayout } from '@/components/layout/main';

export const Route = createFileRoute('/_public')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <MainLayout>
      <Outlet/>
    </MainLayout>
  )
}
