import { createFileRoute, Outlet } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin/gallery')({
  staticData: { crumbs: { title: () => m['pages.gallery.title']() } },
  component: () => <Outlet/>,
});
