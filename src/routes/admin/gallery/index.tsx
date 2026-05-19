import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/gallery/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/gallery/sections', replace: true });
  }
})
