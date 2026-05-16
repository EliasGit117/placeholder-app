import { createFileRoute } from '@tanstack/react-router';
import { ChangePasswordCard } from './-components/change-password-card';
import { MySessionsCard } from './-components/my-sessions-card';

export const Route = createFileRoute('/admin/settings/security')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <ChangePasswordCard className='max-w-none lg:max-w-sm'/>
      <MySessionsCard className='max-w-none lg:max-w-sm h-fit'/>
    </div>
  );
}
