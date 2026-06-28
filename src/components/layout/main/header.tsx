import { type ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { LocaleDropdown } from '@/components/locale';
import { LogoButton } from '../common/logo-button.tsx';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { UserDropdown } from '../../auth/user-dropdown';
import { AppSidebarTrigger } from '@/components/layout/main/sidebar.tsx';
import { Link } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { IconShoppingCart } from '@tabler/icons-react';

interface IProps extends ComponentProps<'header'> {

}

const blurClassName = 'backdrop-blur-sm supports-backdrop-filter:bg-background/75';

export const Header = ({ className, ...props }: IProps) => {
  const { user } = useAuth();
  const links = getLinksPerRole(user?.role);


  return (
    <header className={cn('border-b sticky top-0 z-30', blurClassName, className)} {...props}>
      <nav className="container mx-auto p-4 flex gap-4 items-center">
        <AppSidebarTrigger className="md:hidden"/>
        <LogoButton/>

        {links.length > 0 && (
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {links.map(link => (
              <Button variant="link" className='uppercase underline-offset-8' key={link.to} asChild>
                <Link to={link.to} activeProps={{ className: 'underline text-primary' }}>
                  <span>{link.name}</span>
                </Link>
              </Button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          <Button variant='outline' size='icon' className='rounded-full'>
            <IconShoppingCart/>
          </Button>
          <LocaleDropdown variant="outline" size="icon" align="end" className='rounded-full'/>
          <UserDropdown size='icon' align="end"/>
        </div>
      </nav>
    </header>
  );
};
