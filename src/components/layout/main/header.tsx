import type { ComponentProps } from 'react';
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

export const Header = ({ children, className, ...props }: IProps) => {
  const { user } = useAuth();
  const availableLinks = getLinksPerRole(user?.role)

  return (
    <header className={cn('container mx-auto p-4', className)} {...props}>
      <nav className="flex gap-4 items-center">
        <AppSidebarTrigger className="md:hidden"/>

        <LogoButton/>

        {availableLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {availableLinks.map(link => (
              <Button variant="link" key={link.to} asChild>
                <Link to={link.to} activeProps={{ className: 'underline' }}>
                  <link.icon/>
                  <span>{link.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          <LocaleDropdown variant="ghost" size="icon" align="end"/>

          {!!user && <UserDropdown size='md' align="end" className='ml-2'/>}
        </div>
      </nav>
    </header>
  );
};

