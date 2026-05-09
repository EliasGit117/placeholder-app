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
} from 'src/components/ui/dropdown-menu.tsx';
import { Button, buttonVariants } from 'src/components/ui/button.tsx';
import type { VariantProps } from 'class-variance-authority';
import { IconLogin, IconLogout, IconSettings, IconUser, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from 'src/lib/auth/better-auth-client.ts';
import { orpc } from 'src/lib/orpc';
import { Avatar, AvatarFallback, AvatarImage } from 'src/components/ui/avatar.tsx';
import { Spinner } from 'src/components/ui/spinner.tsx';
import { pickFirstLetters } from 'src/lib/utils';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';


type TButtonSize = NonNullable<VariantProps<typeof buttonVariants>['size']>;
type TButtonValidSize = Extract<TButtonSize, 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'>;

interface IProps extends Omit<ComponentProps<typeof Button>, 'children' | 'size' | 'onClick'> {
  size?: TButtonValidSize;
  align?: 'start' | 'center' | 'end';
}

export const UserDropdown: FC<IProps> = ({ className, align, variant = 'ghost', size = 'icon', ...props }) => {
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
        <Button size={size} variant={variant} className={cn('rounded-full', className)} {...props}>
          <Avatar className="rounded-full">
            <AvatarFallback>
              {!!user ? (
                <>
                  <AvatarImage src={user?.image ?? ''}/>
                  {pickFirstLetters(user?.name, 2)}
                </>
              ) : (
                <IconUser/>
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-fit min-w-48" align={align}>
        {!!user ? (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar size="lg" className="after:rounded-md">
                <AvatarImage src={user.image ?? ''}/>
                <AvatarFallback className="rounded-md text-base">
                  {pickFirstLetters(user.name, 4)}
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
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator/>

            <DropdownMenuItem variant="destructive" disabled={isPending} onClick={() => signOut()}>
              <IconLogout/>
              <span>Sign Out</span>
              {isPending && <Spinner className="ml-auto"/>}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              Authorization
            </DropdownMenuLabel>

            <DropdownMenuSeparator/>

            <DropdownMenuItem>
              <IconLogin/>
              <span>Sign In</span>
            </DropdownMenuItem>

            <DropdownMenuItem>
              <IconUserPlus/>
              <span>Sign Up</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
