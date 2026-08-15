import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { UserAvatar } from '@/components/auth/user-avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { IconMail } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { EditProfileDialog } from '@/routes/admin/settings/-components/edit-profile-dialog.tsx';


export const Route = createFileRoute('/admin/settings/profile')({
  staticData: { crumbs: { title: () => m['pages.settings.tabs.profile']() } },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>{m['pages.settings.profile.title']()}</CardTitle>
          <CardDescription>{m['pages.settings.profile.description']()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" className="after:rounded-lg" imageClassName="rounded-lg" fallbackClassName="rounded-lg"/>
            <div className="space-y-1.5">
              <p className="font-medium leading-none">{user?.name}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <IconMail size={14}/>
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='justify-end gap-2'>
          <EditProfileDialog/>
        </CardFooter>
      </Card>
    </div>
  );
}
