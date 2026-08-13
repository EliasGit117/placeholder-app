import { type ComponentProps, type FC } from 'react';
import { cn } from '@/lib/utils';
import { LocaleDropdown } from '@/components/locale';
import { UserDropdown } from '../../auth/user-dropdown';
import { AppSidebarTrigger } from '@/components/layout/main/sidebar.tsx';
import { IconShoppingCart } from '@tabler/icons-react';
import { HeaderNavigationMenu } from '@/components/layout/main/header-navigation-menu.tsx';
import { Link } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import Logo from '@/assets/icons/logo/icon.svg?react';
import LogoText from '@/assets/icons/logo/text.svg?react';
import { FavoritesPopover } from '@/components/layout/main/favorites-popover.tsx';
import { CartSheetTrigger } from '@/components/cart/cart-sheet';
import { useCartContext } from '@/providers/cart.tsx';


interface IProps extends ComponentProps<'header'> {}

const blurClassName = 'backdrop-blur-xl supports-backdrop-filter:bg-background/75';

export const Header = ({ className, ...props }: IProps) => {
  const { items } = useCartContext();

  return (
    <header className={cn('border-b sticky top-0 z-30 h-16 flex items-center', blurClassName, className)} {...props}>
      <nav className="container mx-auto p-4 flex gap-4 items-center">
        <AppSidebarTrigger className="border border-border rounded-full md:hidden"/>
        <LogoLink/>

        <HeaderNavigationMenu className="hidden md:flex absolute left-1/2 -translate-x-1/2"/>

        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <FavoritesPopover contentClassName='mt-3'/>

          <CartSheetTrigger size="icon" variant="outline" className="rounded-full hidden md:flex relative">
            <IconShoppingCart aria-hidden="true"/>
            <span className="sr-only">{m['components.header.cart']()}</span>

            {items.length > 0 && (
              <span
                className={cn(
                  'absolute -top-1.5 -right-1.5 rounded-full size-4 flex items-center justify-center',
                  'bg-primary text-primary-foreground text-xs'
                )}
              >
                {items.length}
              </span>
            )}
          </CartSheetTrigger>

          <LocaleDropdown variant="outline" size="icon" align="end" className="rounded-full"/>

          <UserDropdown size="icon" align="end"/>
        </div>
      </nav>
    </header>
  );
};


const LogoLink: FC<{ className?: string; }> = ({ className }) => {

  return (
    <Link
      to="/"
      aria-label={m['common.home']()}
      className={cn('flex items-center gap-2.5', className)}
    >
      <div className="border border-primary aspect-square hidden md:flex justify-center items-center size-9">
        <Logo aria-hidden="true" className="h-7 text-foreground"/>
      </div>
      <LogoText aria-hidden="true" className="h-7 sm:h-8 text-foreground"/>
    </Link>
  )
}
