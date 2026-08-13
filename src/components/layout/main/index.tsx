import { Header } from './header.tsx';
import type { FC, PropsWithChildren } from 'react';
import { SiteFooter } from './footer.tsx';
import { AnnouncementBar } from './announcement-bar.tsx';
import { AppSidebar, AppSidebarProvider } from '@/components/layout/main/sidebar.tsx';
import { CartSheet, CartSheetProvider } from '@/components/cart/cart-sheet';

interface IProps extends PropsWithChildren {
}

export const MainLayout: FC<IProps> = ({ children }) => {

  return (
      <AppSidebarProvider>
        <CartSheetProvider>
          <AppSidebar/>

          <AnnouncementBar/>
          <Header/>
          {children}
          <SiteFooter/>

          <CartSheet/>
        </CartSheetProvider>
      </AppSidebarProvider>
  );
};