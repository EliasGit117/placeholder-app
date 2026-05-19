import { createFileRoute } from '@tanstack/react-router'
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/admin/gallery/sections')({
  staticData: { crumbs: { title: () => m['pages.gallery_sections.title']() } },
})
