import { Header } from './header.tsx';
import type { FC, PropsWithChildren } from 'react';
import { Footer } from '../common/footer.tsx';
import { AppSidebar, AppSidebarProvider } from '@/components/layout/main/sidebar.tsx';

interface IProps extends PropsWithChildren {
}

export const MainLayout: FC<IProps> = ({ children }) => {

  return (
    <AppSidebarProvider>
      <AppSidebar/>

      <Header/>
      {children}
      <Footer className='container mx-auto mt-auto'/>
    </AppSidebarProvider>
  );
};