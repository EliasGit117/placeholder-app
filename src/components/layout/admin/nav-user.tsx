import type { FC } from 'react';
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
import { IconLogin, IconLogout, IconSelector, IconSettings, IconUserPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/better-auth-client.ts';
import { orpc } from '@/lib/orpc';
import { UserAvatar } from '@/components/auth/user-avatar.tsx';
import { Spinner } from '@/components/ui/spinner.tsx';
import { Link } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar.tsx';

export const NavUser: FC = () => {
  const { isMobile } = useSidebar();
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
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar user={user} className="size-8 after:rounded-lg" imageClassName="rounded-lg" fallbackClassName="rounded-lg"/>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name ?? m['components.user_dropdown.authorization']()}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
              <IconSelector className="ml-auto"/>
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            {!!user ? (
              <>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserAvatar user={user} className="size-8 after:rounded-lg" imageClassName="rounded-lg" fallbackClassName="rounded-lg"/>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium text-foreground">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/settings">
                      <IconSettings/>
                      <span>{m['components.user_dropdown.settings']()}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator/>

                <DropdownMenuItem variant="destructive" disabled={isPending} onClick={() => signOut()}>
                  <IconLogout/>
                  <span>{m['components.user_dropdown.sign_out']()}</span>
                  {isPending && <Spinner className="ml-auto"/>}
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {m['components.user_dropdown.authorization']()}
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>

                <DropdownMenuItem asChild>
                  <Link to="/auth/sign-in">
                    <IconLogin/>
                    <span>{m['components.user_dropdown.sign_in']()}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link to="/auth/sign-up">
                    <IconUserPlus/>
                    <span>{m['components.user_dropdown.sign_up']()}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};