import { type ComponentProps, type FC } from 'react';
import { cn } from '@/lib/utils';
import { LocaleDropdown } from '@/components/locale';
import { UserDropdown } from '../../auth/user-dropdown';
import { AppSidebarTrigger } from '@/components/layout/main/sidebar.tsx';
import { Button } from '@/components/ui/button';
import { IconShoppingCart } from '@tabler/icons-react';
import { HeaderNavigationMenu } from '@/components/layout/main/header-navigation-menu.tsx';
import { Link } from '@tanstack/react-router';
import Logo from '@/assets/icons/logo/icon.svg?react';
import LogoText from '@/assets/icons/logo/text.svg?react';


interface IProps extends ComponentProps<'header'> {

}

const blurClassName = 'backdrop-blur-xl supports-backdrop-filter:bg-background/75';

export const Header = ({ className, ...props }: IProps) => {

  return (
    <header className={cn('border-b sticky top-0 z-30 h-16 flex items-center', blurClassName, className)} {...props}>
      <nav className="container mx-auto p-4 flex gap-4 items-center">
        <AppSidebarTrigger className="border border-border rounded-full md:hidden"/>
        <LogoLink className='absolute left-1/2 -translate-x-1/2 md:static md:left-0 md:translate-x-0'/>

        <HeaderNavigationMenu className="hidden md:flex absolute left-1/2 -translate-x-1/2"/>

        <div className="flex items-center gap-1.5 sm:gap-3 ml-auto">
          <Button variant="outline" size="icon" className="rounded-full hidden md:flex">
            <IconShoppingCart/>
          </Button>
          <LocaleDropdown variant="outline" size="icon" align="end" className="rounded-full"/>
          <UserDropdown size="icon" align="end"/>
        </div>
      </nav>
    </header>
  );
};


const LogoLink: FC<{ className?: string; }> = ({ className }) => {

  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <figure className="border border-primary aspect-square hidden sm:flex justify-center items-center size-9">
        <Logo className="h-7 text-foreground"/>
      </figure>
      <LogoText className="h-8 text-foreground"/>
    </Link>
  )
}
