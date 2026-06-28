import { type ComponentProps, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button.tsx';
import { cn } from '@/lib/utils';
import { LocaleDropdown } from '@/components/locale';
import { LogoButton } from '../common/logo-button.tsx';
import { useAuth } from '@/hooks/use-auth.ts';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { UserDropdown } from '../../auth/user-dropdown';
import { AppSidebarTrigger } from '@/components/layout/main/sidebar.tsx';


interface IProps extends ComponentProps<'header'> {

}

export const Header = ({ className, ...props }: IProps) => {
  const { user } = useAuth();
  const availableLinks = getLinksPerRole(user?.role);

  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let ticking = false;

    const updateScrolledState = () => {
      if (!headerRef.current) return;
      const isScrolled = window.scrollY > 0;
      headerRef.current.setAttribute('data-scrolled', isScrolled ? 'true' : 'false');
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(updateScrolledState);
      ticking = true;
    };

    updateScrolledState();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      data-scrolled="false"
      className={cn(getHeaderClassName(), className)}
      {...props}
    >
      <nav className="container mx-auto p-4 flex gap-4 items-center">
        <AppSidebarTrigger className="md:hidden"/>

        <LogoButton/>

        {availableLinks.length > 0 && (
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
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

          {!!user && <UserDropdown align="end" className="ml-2"/>}
        </div>
      </nav>
    </header>
  );
};

function getHeaderClassName() {
  return cn(
    'top-0 left-0 right-0 z-30 border-b border-transparent',
    'sticky data-[scrolled=true]:border-border data-[scrolled=true]:bg-background/95',
    'data-[scrolled=true]:supports-[backdrop-filter]:bg-background/75',
    'data-[scrolled=true]:backdrop-blur'
  );
}
