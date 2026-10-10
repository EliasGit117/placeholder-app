import { createFileRoute, Outlet } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin/brands')({
  staticData: { crumbs: { title: () => m['pages.brands.title']() } },
  component: () => <Outlet/>,
});
