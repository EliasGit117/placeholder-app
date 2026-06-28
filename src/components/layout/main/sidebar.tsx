import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { type ComponentProps, type FC, type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { IconLayoutSidebar, IconMenu2Filled } from '@tabler/icons-react';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import { LogoButton } from '@/components/layout/common';
import { getLinksPerRole } from '@/components/layout/main/links.ts';
import { useAuth } from '@/hooks/use-auth.ts';
import { Link } from '@tanstack/react-router';


interface IAppSidebarContext {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  open: () => void;
  close: () => void;
}

const [AppSidebarContext, useAppSidebar] = contextFactory<IAppSidebarContext>({ name: 'AppSidebarContext' });

export const AppSidebarProvider = ({ children }: { children: ReactNode; }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <AppSidebarContext.Provider value={{ isOpen, setIsOpen, open, close }}>
      {children}
    </AppSidebarContext.Provider>
  );
};


export const AppSidebar = () => {
  const { user } = useAuth();
  const { isOpen, setIsOpen } = useAppSidebar();
  const availableLinks = getLinksPerRole(user?.role);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" showCloseButton={false}>
        <SheetHeader className="hidden">
          <SheetTitle/>
          <SheetDescription/>
        </SheetHeader>

        <LogoButton className="mx-4 mt-4"/>

        {availableLinks.length > 0 && (
          <div className="flex flex-col gap-4 px-3 mt-4 overflow-y-auto">
            {availableLinks.map(link => (
              <Button
                key={link.to}
                variant="link"
                className="justify-start text-base gap-2"
                onClick={() => setIsOpen(false)}
                asChild
              >
                <Link to={link.to} activeProps={{ className: 'underline underline-offset-4' }}>
                  {link.icon && <link.icon className="size-5"/>}
                  {link.name}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};


interface IAppSidebarTrigger extends ComponentProps<typeof Button> {
  iconProps?: ComponentProps<typeof IconLayoutSidebar>;
}

export const AppSidebarTrigger: FC<IAppSidebarTrigger> = ({ className, onClick, iconProps, ...props }) => {
  const { open } = useAppSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn(className)}
      onClick={(event) => {
        onClick?.(event);
        open();
      }}
      {...props}
    >
      <IconMenu2Filled {...iconProps}/>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

