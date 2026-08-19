import { createFileRoute } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin/orders')({
  staticData: { crumbs: { title: () => m['pages.orders.title']() } },
});
