import { createFileRoute, Outlet } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin/banners')({
  staticData: { crumbs: { title: () => m['pages.banners.title']() } },
  component: () => <Outlet/>,
});
