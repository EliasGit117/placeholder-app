import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IconLock, IconUser } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/admin/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const { pathname } = useLocation();
  const activeTab = pathname.includes('/security') ? 'security' : 'profile';

  return (
    <div className="space-y-6">
      <Tabs value={activeTab}>
        <TabsList className='grid grid-cols-2 w-full sm:w-fit sm:min-w-84'>
          <TabsTrigger value="profile" asChild>
            <Link to="/admin/settings/profile">
              <IconUser size={15}/>
              {m['pages.settings.tabs.profile']()}
            </Link>
          </TabsTrigger>
          <TabsTrigger value="security" asChild>
            <Link to="/admin/settings/security">
              <IconLock size={15}/>
              {m['pages.settings.tabs.security']()}
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Outlet/>
    </div>
  );
}
