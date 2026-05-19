import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { UpdateNameDialog } from './-components/update-name-dialog';
import { pickFirstLetters } from '@/lib/utils';

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
            <Avatar size='lg'>
              <AvatarFallback>
                {pickFirstLetters(user?.name ?? '', 2, 'uppercase')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <p className="font-medium leading-none">{user?.name}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <IconMail size={14}/>
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className='justify-end'>
          <UpdateNameDialog/>
        </CardFooter>
      </Card>
    </div>
  );
}
