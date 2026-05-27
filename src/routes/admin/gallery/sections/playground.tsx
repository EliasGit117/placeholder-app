import { createFileRoute } from '@tanstack/react-router'
import { Pattern } from '@/routes/admin/gallery/sections/-components/pattern.tsx';

export const Route = createFileRoute('/admin/gallery/sections/playground')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='space-y-4'>
      <Pattern/>
    </main>
  )
}
