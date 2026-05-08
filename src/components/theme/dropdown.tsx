import { useTheme } from 'better-themes';
import { Button, buttonVariants } from '@/components/ui/button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem, DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';
import { IconMoon, IconPalette, IconSun, type TablerIcon } from '@tabler/icons-react';
import type { ComponentProps, FC } from 'react';
import type { VariantProps } from 'class-variance-authority';


const themes = ['light', 'dark', 'system'] as const;
type TTheme = (typeof themes)[number];

const themeOptions: { label: string, icon: TablerIcon, value: TTheme }[] = [
  { label: 'Light', icon: IconSun, value: 'light' },
  { label: 'Dark', icon: IconMoon, value: 'dark' },
  { label: 'System', icon: IconPalette, value: 'system' }
];


function isThemeOption(value: string): value is TTheme {
  return themes.includes(value as TTheme);
}

interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick' | 'size'> {
  size?: Extract<VariantProps<typeof buttonVariants>["size"],"icon-sm" | "icon" | "icon-lg">;
  align?: 'start' | 'center' | 'end';
}

export const ThemeDropdown: FC<IProps> = ({ variant = 'outline', size = 'icon', align, ...props }) => {
  const { theme, setTheme } = useTheme();

  const currentOption = themeOptions.find(option => option.value === theme);

  const handleThemeChange = (value: string) => {
    if (!isThemeOption(value))
      return;

    setTheme(value);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} {...props}>
          <IconSun className='dark:hidden'/>
          <IconMoon className='hidden dark:block'/>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator/>
          <DropdownMenuRadioGroup value={currentOption?.value} onValueChange={handleThemeChange}>
            {themeOptions.map(({ icon: Icon, label, value }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon className="text-muted-foreground"/>
                <span>{label}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
