import type { ComponentPropsWithoutRef, FC } from 'react';
import {
  IconCategory,
  IconChevronRight,
  IconDashboard,
  IconKey,
  IconLanguage,
  IconLibraryPhoto,
  IconPackage,
  IconPhoto,
  IconShieldLock, IconShoppingCart,
  IconUsers,
  type TablerIcon
} from '@tabler/icons-react';
import { Link, type LinkOptions, useLocation } from '@tanstack/react-router';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar
} from '@/components/ui/sidebar.tsx';
import { cn } from '@/lib/utils';
import { envConfig } from '@/lib/config';
import { getLocale, isLocale, setLocale, type Locale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';
import { SessionState } from '@/features/sessions/schemas/search-sessions.ts';
import Logo from '@/assets/icons/logo/icon.svg?react';



interface INavItem {
  title: () => string;
  linkOptions: LinkOptions;
  icon?: TablerIcon;
}

interface ISidebarMenuItem {
  title: () => string;
  linkOptions?: LinkOptions;
  icon?: TablerIcon;
  items?: INavItem[];
}

const navMain: ISidebarMenuItem[] = [
  {
    title: () => m['components.sidebar.nav.dashboard'](),
    icon: IconDashboard,
    linkOptions: { to: '/admin', activeOptions: { includeSearch: false, exact: true } }
  },
  {
    title: () => m['components.sidebar.nav.catalog'](),
    icon: IconShoppingCart,
    items: [
      {
        title: () => m['pages.categories.title'](),
        icon: IconCategory,
        linkOptions: { to: '/admin/categories', activeOptions: { includeSearch: false } }
      },
      {
        title: () => m['pages.products.title'](),
        icon: IconPackage,
        linkOptions: { to: '/admin/products', activeOptions: { includeSearch: false } }
      }
    ]
  },
  {
    title: () => m['pages.banners.title'](),
    icon: IconPhoto,
    linkOptions: { to: '/admin/banners', activeOptions: { includeSearch: false } }
  },
  {
    title: () => m['pages.gallery.title'](),
    icon: IconLibraryPhoto,
    linkOptions: { to: '/admin/gallery', activeOptions: { includeSearch: false } }
  },
  {
    title: () => m['components.sidebar.nav.security'](),
    icon: IconShieldLock,
    items: [
      {
        title: () => m['pages.users.title'](),
        icon: IconUsers,
        linkOptions: { to: '/admin/users', activeOptions: { includeSearch: false } }
      },
      {
        title: () => m['pages.sessions.title'](),
        icon: IconKey,
        linkOptions: {
          to: '/admin/sessions',
          search: {
            status: [SessionState.Active]
          },
          activeOptions: {
            includeSearch: false,
          }
        }
      }
    ]
  }
];

const collapsedSidebarIconClassName = 'group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]>svg:first-child]:size-5! group-data-[collapsible=icon]:[&_[data-sidebar=menu-button]>svg:first-child]:-ml-0.5';

export const AdminSidebar: FC<ComponentPropsWithoutRef<typeof Sidebar>> = ({ className, ...props }) => {
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className={cn(collapsedSidebarIconClassName, className)} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/" onClick={() => setOpenMobile(false)}>
                <figure className='border border-primary aspect-square flex justify-center items-center size-9'>
                  <Logo className="size-7! text-foreground"/>
                </figure>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium uppercase">{envConfig.appName}</span>
                  <span className="truncate text-xs text-muted-foreground">Admin</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="group-data-[collapsible=icon]:pt-2">
        <NavSidebarGroup label={m['components.sidebar.nav.main']()} items={navMain}/>
      </SidebarContent>

      <SidebarFooter>
        <NavPreferences/>
      </SidebarFooter>

      <SidebarRail/>
    </Sidebar>
  );
};

interface INavSidebarGroupProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
  label?: string;
  items: ISidebarMenuItem[];
  itemsSize?: ComponentPropsWithoutRef<typeof SidebarMenuButton>['size'];
}

const sidebarMenuSubButtonSizes: Record<
  NonNullable<ComponentPropsWithoutRef<typeof SidebarMenuButton>['size']>,
  ComponentPropsWithoutRef<typeof SidebarMenuSubButton>['size']
> = { default: 'md', sm: 'sm', lg: 'md' };

const NavSidebarGroup: FC<INavSidebarGroupProps> = ({ label, items, itemsSize, ...props }) => {
  const { setOpenMobile } = useSidebar();
  const { pathname } = useLocation({ select: (state) => ({ pathname: state.pathname }) });

  return (
    <SidebarGroup {...props}>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const hasChildren = !!item.items?.length;
            const hasActiveChild = item.items?.some((subItem) => isLinkActive(pathname, subItem.linkOptions)) ?? false;

            if (!hasChildren) {
              return (
                <SidebarMenuItem key={item.title()}>
                  <SidebarMenuButton
                    size={itemsSize}
                    tooltip={item.title()}
                    isActive={isLinkActive(pathname, item.linkOptions)}
                    onClick={() => setOpenMobile(false)}
                    asChild
                  >
                    <Link {...item.linkOptions}>
                      {item.icon && <item.icon/>}
                      <span>{item.title()}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            }

            return (
              <Collapsible key={item.title()} defaultOpen={hasActiveChild} className="group/collapsible" asChild>
                <SidebarMenuItem>
                  {!!item.linkOptions ? (
                    <>
                      <SidebarMenuButton
                        size={itemsSize}
                        tooltip={item.title()}
                        onClick={() => setOpenMobile(false)}
                        asChild
                      >
                        <Link {...item.linkOptions}>
                          {item.icon && <item.icon/>}
                          <span>{item.title()}</span>
                        </Link>
                      </SidebarMenuButton>

                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction>
                          <IconChevronRight
                            className="transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                          <span className="sr-only">Toggle {item.title()}</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                    </>
                  ) : (
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton size={itemsSize} tooltip={item.title()}>
                        {item.icon && <item.icon/>}
                        <span>{item.title()}</span>
                        <IconChevronRight
                          className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90"/>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                  )}

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title()}>
                          <SidebarMenuSubButton
                            size={sidebarMenuSubButtonSizes[itemsSize ?? 'default']}
                            isActive={isLinkActive(pathname, subItem.linkOptions)}
                            asChild
                          >
                            <Link
                              {...subItem.linkOptions}
                              onClick={() => setOpenMobile(false)}
                            >
                              {subItem.icon && <subItem.icon/>}
                              <span>{subItem.title()}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

interface INavPreferencesProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
  itemsSize?: ComponentPropsWithoutRef<typeof SidebarMenuButton>['size'];
}

const localeOptions = [
  { label: 'Romana', shortLabel: 'RO', value: 'ro' },
  { label: 'Русский', shortLabel: 'RU', value: 'ru' }
] satisfies { label: string; shortLabel: string; value: Locale }[];

const NavPreferences: FC<INavPreferencesProps> = ({ itemsSize, ...props }) => {
  const { isMobile } = useSidebar();
  const locale = getLocale();

  function handleLocaleChange(value: string) {
    if (!isLocale(value))
      return;

    setLocale(value);
  }

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size={itemsSize}>
                  <IconLanguage className="text-muted-foreground"/>
                  <span>{m['components.sidebar.language']()}</span>
                  <span className="ml-auto text-xs uppercase text-muted-foreground">{locale}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn('w-(--radix-dropdown-menu-trigger-width) rounded-lg', !isMobile && 'max-w-44')}
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <span>{m['components.sidebar.language']()}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  {localeOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      <span className="text-xs uppercase text-muted-foreground">{option.shortLabel}</span>
                      <span>{option.label}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

const normalize = (p: string) => p.replace(/\/$/, '');

const isLinkActive = (pathname: string, linkOptions?: LinkOptions) => {
  const path = linkOptions?.to ?? linkOptions?.href;
  const exact = linkOptions?.activeOptions?.exact ?? false;
  if (!path)
    return false;

  const normalPath = normalize(String(path));
  const normalCurrent = normalize(pathname);

  if (exact)
    return normalCurrent === normalPath;

  return normalCurrent === normalPath || normalCurrent.startsWith(`${normalPath}/`);
};
