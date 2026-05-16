import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/settings/')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/settings/profile', replace: true });
  },
  component: () => null,
});
