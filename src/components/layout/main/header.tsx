import { type ComponentProps } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils';
import { LocaleDropdown } from '@/components/locale';
import { LogoButton } from '../common/logo-button.tsx';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { UserDropdown } from '../common/user-dropdown.tsx';
import { AppSidebarTrigger } from '@/components/layout/main/sidebar.tsx';


interface IProps extends ComponentProps<'header'> {

}

const blurClassName = 'backdrop-blur-sm supports-backdrop-filter:bg-background/75';

export const Header = ({ className, ...props }: IProps) => {
  const { user } = useAuth();
  const availableLinks = getLinksPerRole(user?.role);


  return (
    <header
      className={cn('border-b sticky top-0 z-30', blurClassName, className)} {...props}>
      <nav className="container mx-auto p-4 flex gap-4 items-center">
        <AppSidebarTrigger className="md:hidden"/>

        <LogoButton/>

        <div className="flex items-center gap-1 ml-auto">
          <LocaleDropdown variant="ghost" size="icon" align="end"/>

          {!!user && <UserDropdown size="md" align="end" className="ml-2"/>}
        </div>
      </nav>
    </header>
  );
};
