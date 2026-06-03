import { createFileRoute } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin/products')({
  staticData: { crumbs: { title: () => m['pages.products.title']() } },
});
