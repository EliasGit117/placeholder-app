import type { ComponentProps, FC, ReactNode } from 'react';
import { IconChevronRight, IconMenu2Filled } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import {
  Sidebar,
  SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuAction, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  SidebarProvider,
  useSidebar
} from '@/components/ui/sidebar.tsx';
import { Button } from '@/components/ui/button';
import { LogoButton } from '@/components/layout/common';
import { NavUser } from '@/components/layout/main/nav-user.tsx';
import { NavPreferences } from '@/components/layout/main/nav-preferences.tsx';
import { orpc } from '@/lib/orpc';
import { useAuth } from '@/hooks/use-auth.ts';
import { Link, type LinkOptions, useLocation } from '@tanstack/react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';
import { m } from '@/paraglide/messages';
import type { ICategoryNodeDto, TCategoryForestDto } from '@/features/categories/public/dtos/category-tree.ts';


export const AppSidebarProvider = ({ children }: { children: ReactNode }) => (
  <SidebarProvider defaultOpen={false} className="contents">
    {children}
  </SidebarProvider>
);

export const AppSidebar = () => {
  const { pathname, categoryId } = useLocation({
    select: (state) => ({
      pathname: state.pathname,
      categoryId: (state.search as { categoryId?: number }).categoryId
    })
  });
  const { setOpenMobile } = useSidebar();
  const { user } = useAuth();
  const close = () => setOpenMobile(false);

  const { data: categories, isPending: isCategoriesPending } = useQuery(
    orpc.categories.getTree.queryOptions({ input: { depth: 3 } })
  );

  return (
    <Sidebar side="left" className="bg-background text-foreground">
      <SidebarHeader>
        <LogoButton className="mx-2 mt-2"/>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className='text-sm'>
            {m['components.sidebar.nav.main']()}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={close}
                  className="text-base font-normal"
                  isActive={isLinkActive(pathname, categoryId, { to: '/', activeOptions: { exact: true } })}
                  asChild
                >
                  <Link to="/">
                    <span>{m['common.home']()}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={close} className="text-base font-normal" asChild>
                  <Link to="/">
                    <span>{m['components.footer.contact']()}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton onClick={close} className="text-base font-normal" asChild>
                  <Link to="/">
                    <span>{m['pages.home.about.eyebrow']()}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {user?.role === 'admin' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={close}
                    className="text-base font-normal"
                    isActive={isLinkActive(pathname, categoryId, { to: '/admin' })}
                    asChild
                  >
                    <Link to="/admin">
                      <span>{m['components.header.admin']()}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className='text-sm'>
            {m['components.sidebar.nav.catalog']()}
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={close}
                  className="text-base font-normal"
                  isActive={isLinkActive(pathname, categoryId, { to: '/products' })}
                  asChild
                >
                  <Link to="/products">
                    <span>{m['components.header.products']()}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isCategoriesPending ? (
                Array.from({ length: 5 }).map((_, i) => <SidebarMenuSkeleton key={i}/>)
              ) : (
                !!categories?.length && (
                  <CategorySidebarItems categories={categories} pathname={pathname} categoryId={categoryId} onNavigate={close}/>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavPreferences className="mt-auto"/>
      </SidebarContent>

      <SidebarFooter>
        <NavUser/>
      </SidebarFooter>
    </Sidebar>
  );
};


interface ICategorySidebarItemsProps {
  categories: TCategoryForestDto;
  pathname: string;
  categoryId: number | undefined;
  onNavigate: () => void;
}

const CategorySidebarItems: FC<ICategorySidebarItemsProps> = ({ categories, pathname, categoryId, onNavigate }) => (
  <>
    {categories.map((category) => {
      const hasChildren = category.children.length > 0;
      const isActive = isLinkActive(pathname, categoryId, categoryLinkOptions(category));

      if (!hasChildren) {
        return (
          <SidebarMenuItem key={category.slug}>
            <SidebarMenuButton onClick={onNavigate} className="text-base font-normal" isActive={isActive} asChild>
              <CategoryLink category={category}>
                <span>{category.name}</span>
              </CategoryLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      }

      return (
        <Collapsible key={category.slug} className="group/collapsible" asChild>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onNavigate} className="text-base font-normal" isActive={isActive} asChild>
              <CategoryLink category={category}>
                <span>{category.name}</span>
              </CategoryLink>
            </SidebarMenuButton>

            <CollapsibleTrigger asChild>
              <SidebarMenuAction>
                <IconChevronRight
                  className="size-4.5! transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                <span className="sr-only">{m['common.expand']()}</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                <CategorySidebarSubItems categories={category.children} pathname={pathname} categoryId={categoryId}
                                         onNavigate={onNavigate}/>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      );
    })}
  </>
);

const CategorySidebarSubItems: FC<ICategorySidebarItemsProps> = ({ categories, pathname, categoryId, onNavigate }) => (
  <>
    {categories.map((category) => {
      const hasChildren = category.children.length > 0;
      const isActive = isLinkActive(pathname, categoryId, categoryLinkOptions(category));

      if (!hasChildren) {
        return (
          <SidebarMenuSubItem key={category.slug}>
            <SidebarMenuSubButton className="font-normal" isActive={isActive} asChild>
              <CategoryLink category={category} onClick={onNavigate}>
                <span>{category.name}</span>
              </CategoryLink>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        );
      }

      return (
        <Collapsible key={category.slug} className="group/collapsible" asChild>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton className="font-normal" isActive={isActive} asChild>
              <CategoryLink category={category} onClick={onNavigate}>
                <span>{category.name}</span>
              </CategoryLink>
            </SidebarMenuSubButton>

            <CollapsibleTrigger asChild>
              <SidebarMenuAction>
                <IconChevronRight
                  className="size-4.5! transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                <span className="sr-only">{m['common.expand']()}</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                <CategorySidebarSubItems categories={category.children} pathname={pathname} categoryId={categoryId}
                                         onNavigate={onNavigate}/>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuSubItem>
        </Collapsible>
      );
    })}
  </>
);

const categoryLinkOptions = (category: ICategoryNodeDto): LinkOptions => ({
  to: '/products',
  search: { categoryId: category.id }
});

interface ICategoryLinkProps extends ComponentProps<'a'> {
  category: ICategoryNodeDto;
}

const CategoryLink: FC<ICategoryLinkProps> = ({ category, ...props }) => (
  <Link to="/products" search={{ categoryId: category.id }} {...props}/>
);


interface IAppSidebarTrigger extends ComponentProps<typeof Button> {
  iconProps?: ComponentProps<typeof IconMenu2Filled>;
}

export const AppSidebarTrigger: FC<IAppSidebarTrigger> = ({ className, onClick, iconProps, ...props }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={className}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <IconMenu2Filled {...iconProps}/>
      <span className="sr-only">{m['components.header.toggle_sidebar']()}</span>
    </Button>
  );
};


const normalize = (p: string) => p.replace(/\/$/, '');

const isLinkActive = (pathname: string, currentCategoryId: number | undefined, linkOptions?: LinkOptions) => {
  const path = linkOptions?.to ?? linkOptions?.href;
  const exact = linkOptions?.activeOptions?.exact ?? false;
  if (!path)
    return false;

  const normalPath = normalize(String(path));
  const normalCurrent = normalize(pathname);

  const pathMatches = exact
    ? normalCurrent === normalPath
    : normalCurrent === normalPath || normalCurrent.startsWith(`${normalPath}/`);

  if (!pathMatches)
    return false;

  const targetCategoryId = (linkOptions?.search as { categoryId?: number } | undefined)?.categoryId;
  return targetCategoryId === currentCategoryId;
};
