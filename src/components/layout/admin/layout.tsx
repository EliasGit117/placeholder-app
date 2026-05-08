import type { ComponentProps, FC } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar.tsx';
import { Footer } from '../common/footer';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './sidebar.tsx';
import { UserDropdown } from '../common/user-dropdown.tsx';


interface IProps extends ComponentProps<'div'> {}

export const AdminLayout: FC<IProps> = ({ className, children, ...divProps }) => {

  return (
    <SidebarProvider>
      <AdminSidebar/>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-10 flex h-12 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <SidebarTrigger/>
          <UserDropdown align="end"/>
        </header>

        <div className={cn('p-4 flex flex-col flex-1 gap-4', className)} {...divProps}>
          {children}
          <Footer className="mt-auto px-0 py-2"/>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
