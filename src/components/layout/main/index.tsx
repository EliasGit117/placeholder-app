import { Header } from './header.tsx';
import type { FC, PropsWithChildren } from 'react';
import { SiteFooter } from './footer.tsx';
import { AnnouncementBar } from './announcement-bar.tsx';
import { AppSidebar, AppSidebarProvider } from '@/components/layout/main/sidebar.tsx';
import { CartSheet, CartSheetProvider } from '@/components/cart/cart-sheet';
import { WhatsAppButton } from './whatsapp-button.tsx';
import { Breadcrumbs } from '@/components/layout/common/breadcrumbs';

interface IProps extends PropsWithChildren {
}

export const MainLayout: FC<IProps> = ({ children }) => {

  return (
      <AppSidebarProvider>
        <CartSheetProvider>
          <AppSidebar/>

          <AnnouncementBar/>
          <Header/>
          <Breadcrumbs className="container mx-auto px-4 pt-4"/>
          {children}
          {/* Room above the footer so the floating WhatsApp button never covers page content */}
          <div className="h-16 sm:h-20" aria-hidden/>
          <SiteFooter/>

          <CartSheet/>
          <WhatsAppButton/>
        </CartSheetProvider>
      </AppSidebarProvider>
  );
};