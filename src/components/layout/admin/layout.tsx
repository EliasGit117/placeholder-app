import type { ComponentProps, FC } from 'react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar.tsx';
import { Footer } from '../common/footer';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './sidebar.tsx';
import { Header } from './header';


interface IProps extends ComponentProps<'div'> {}

export const AdminLayout: FC<IProps> = ({ className, children, ...divProps }) => {

  return (
    <SidebarProvider>
      <AdminSidebar/>
      <SidebarInset className="min-w-0">
        <Header/>

        <div className={cn('p-4 flex flex-col flex-1 gap-4', className)} {...divProps}>
          {children}
          <Footer className="mt-auto p-0"/>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
