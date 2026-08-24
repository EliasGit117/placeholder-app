import type { ComponentPropsWithoutRef, FC } from 'react';
import { IconLanguage } from '@tabler/icons-react';
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar.tsx';
import { cn } from '@/lib/utils';
import { getLocale, isLocale, setLocale, type Locale } from '@/paraglide/runtime';
import { m } from '@/paraglide/messages';


interface INavPreferencesProps extends ComponentPropsWithoutRef<typeof SidebarGroup> {
  itemsSize?: ComponentPropsWithoutRef<typeof SidebarMenuButton>['size'];
}

const localeOptions = [
  { label: 'Romana', shortLabel: 'RO', value: 'ro' },
  { label: 'Русский', shortLabel: 'RU', value: 'ru' }
] satisfies { label: string; shortLabel: string; value: Locale }[];

export const NavPreferences: FC<INavPreferencesProps> = ({ itemsSize, ...props }) => {
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