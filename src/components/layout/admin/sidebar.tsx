import type { ComponentPropsWithoutRef, FC } from 'react';
import {
  IconCategory,
  IconCheckbox,
  IconChevronRight,
  IconDashboard,
  IconKey,
  IconLanguage,
  IconMoon,
  IconPalette,
  IconSettings,
  IconShieldLock,
  IconSun,
  IconUsers,
  type TablerIcon
} from '@tabler/icons-react';
import { Link, type LinkOptions, useLocation } from '@tanstack/react-router';
import { useTheme } from 'better-themes';
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
import logo from '/images/common/logo_sm.png';


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
    items: [
      {
        title: () => m['components.sidebar.nav.main'](),
        icon: IconCheckbox,
        linkOptions: { to: '/admin', activeOptions: { includeSearch: false, exact: true } }
      }
    ]
  },
  {
    title: () => m['components.sidebar.nav.catalog'](),
    icon: IconCategory,
    items: [
      {
        title: () => m['components.sidebar.nav.categories'](),
        icon: IconCategory,
        linkOptions: { to: '/admin/categories', activeOptions: { includeSearch: false } }
      }
    ]
  },
  {
    title: () => m['components.sidebar.nav.security'](),
    icon: IconShieldLock,
    items: [
      {
        title: () => m['components.sidebar.nav.users'](),
        icon: IconUsers,
        linkOptions: { to: '/admin/users', activeOptions: { includeSearch: false } }
      },
      {
        title: () => m['components.sidebar.nav.sessions'](),
        icon: IconKey,
        linkOptions: { to: '/admin/sessions', activeOptions: { includeSearch: false } }
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
              <Link to="/admin" onClick={() => setOpenMobile(false)}>
                <figure
                  className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-clip rounded-md">
                  <img src={logo} alt="" className="size-full grayscale invert dark:invert-0"/>
                </figure>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{envConfig.appName}</span>
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

const themeOptions = [
  { title: () => m['components.sidebar.system'](), value: 'system', icon: IconPalette },
  { title: () => m['components.sidebar.light'](), value: 'light', icon: IconSun },
  { title: () => m['components.sidebar.dark'](), value: 'dark', icon: IconMoon }
] satisfies { title: () => string; value: string; icon: TablerIcon }[];

const localeOptions = [
  { label: 'Romana', shortLabel: 'RO', value: 'ro' },
  { label: 'Русский', shortLabel: 'RU', value: 'ru' }
] satisfies { label: string; shortLabel: string; value: Locale }[];

const NavPreferences: FC<INavPreferencesProps> = ({ itemsSize, ...props }) => {
  const { isMobile } = useSidebar();
  const { theme, setTheme } = useTheme();
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
                  <IconSettings className="text-muted-foreground"/>
                  <span>{m['components.sidebar.theme']()}</span>
                  <IconSun className="ml-auto dark:hidden"/>
                  <IconMoon className="ml-auto hidden dark:block"/>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className={cn('w-(--radix-dropdown-menu-trigger-width) rounded-lg', !isMobile && 'max-w-44')}
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <span>{m['components.sidebar.theme']()}</span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator/>
                  {themeOptions.map(({ icon: Icon, title, value }) => (
                    <DropdownMenuRadioItem value={value} key={value}>
                      <Icon/>
                      <span>{title()}</span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

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

const isLinkActive = (pathname: string, linkOptions?: LinkOptions) => {
  const path = linkOptions?.to ?? linkOptions?.href;
  const exact = linkOptions?.activeOptions?.exact ?? false;
  if (!path)
    return false;

  if (exact)
    return pathname === path;

  return pathname === path || pathname.startsWith(`${path}/`);
};
