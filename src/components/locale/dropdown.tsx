'use client';

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
import { getLocale, isLocale, setLocale, type Locale } from '@/paraglide/runtime';
import { IconWorld } from '@tabler/icons-react';
import { type ComponentProps, type FC } from 'react';
import type { VariantProps } from 'class-variance-authority';

const localeOptions: { label: string, shortLabel: string, value: Locale }[] = [
  { label: 'Românǎ', shortLabel: 'RO', value: 'ro' },
  { label: 'Русский', shortLabel: 'RU', value: 'ru' }
];


interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick' | 'size'> {
  size?: Extract<VariantProps<typeof buttonVariants>["size"],"icon-sm" | "icon" | "icon-lg">;
  align?: 'start' | 'center' | 'end';
}

export const LocaleDropdown: FC<IProps> = ({ variant = 'outline', size = 'icon', align, ...props }) => {
  const locale = getLocale();

  function handleLocaleChange(value: string) {
    if (!isLocale(value))
      return;

    setLocale(value);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} {...props}>
          <IconWorld/>
        </Button>
      </DropdownMenuTrigger>


      <DropdownMenuContent align={align} className="min-w-36">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Language</DropdownMenuLabel>
          <DropdownMenuSeparator/>
          <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
            {localeOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <span className="text-muted-foreground text-xs">
                  {option.shortLabel}
                </span>

                <span>{option.label}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
