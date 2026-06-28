import type { ComponentProps, FC } from 'react';
import { useAuth } from '@/hooks/use-auth.ts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import { IconLogin, IconLogout, IconSettings, IconUser, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/better-auth-client.ts';
import { orpc } from '@/lib/orpc';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { pickFirstLetters } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import { Button } from '@/components/ui/button.tsx';



interface IProps extends Omit<ComponentProps<typeof Button>, 'children' | 'onClick'> {
  align?: 'start' | 'center' | 'end';
}

export const UserDropdown: FC<IProps> = ({ className, align, variant = 'outline', size = 'icon', ...props }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { mutate: signOut, isPending } = useMutation({
    mutationKey: ['sign-out'],
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orpc.sessions.current.queryKey() });
    }
  });


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn('rounded-full', className)} size={size} variant={variant} {...props}>
          <Avatar>
            {!!user ? (
              <>
                <AvatarImage src={user?.image ?? ''}/>
                <AvatarFallback>
                  {pickFirstLetters(user?.name, 2)}
                </AvatarFallback>
              </>
            ) : (
              <IconUser/>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-fit min-w-48" align={align}>
        {!!user ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar size="lg" className="after:rounded-md">
                <AvatarImage src={user.image ?? ''} className="rounded-md"/>
                <AvatarFallback className="rounded-md text-base">
                  {pickFirstLetters(user.name, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-0.5">
                <span className="text-foreground text-sm">
                  {user.name}
                </span>
                <span>
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator/>

            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <IconSettings/>
                <span>{m['components.user_dropdown.settings']()}</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator/>

            <DropdownMenuItem variant="destructive" disabled={isPending} onClick={() => signOut()}>
              <IconLogout/>
              <span>{m['components.user_dropdown.sign_out']()}</span>
              {isPending && <Spinner className="ml-auto"/>}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              {m['components.user_dropdown.authorization']()}
            </DropdownMenuLabel>

            <DropdownMenuSeparator/>

            <DropdownMenuItem>
              <IconLogin/>
              <span>{m['components.user_dropdown.sign_in']()}</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <IconUserPlus/>
              <span>{m['components.user_dropdown.sign_up']()}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
