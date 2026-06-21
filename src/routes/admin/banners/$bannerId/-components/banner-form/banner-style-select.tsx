import type { FC } from 'react';
import { IconChevronDown, IconSun, IconMoon } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { m } from '@/paraglide/messages';
import { BannerStyle } from '~/prisma/generated/prisma/enums.ts';


const options = [
  { value: BannerStyle.LIGHT, label: () => m['pages.banners.detail.style_light'](), icon: IconSun },
  { value: BannerStyle.DARK, label: () => m['pages.banners.detail.style_dark'](), icon: IconMoon },
];

interface IProps {
  value: BannerStyle;
  onChange: (value: BannerStyle) => void;
  disabled?: boolean;
}

export const BannerStyleSelect: FC<IProps> = ({ value, onChange, disabled }) => {
  const current = options.find((o) => o.value === value) ?? options[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start" disabled={disabled}>
          <CurrentIcon className="text-muted-foreground" size={16}/>
          <span>{current.label()}</span>
          <IconChevronDown className="ml-auto opacity-50" size={16}/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit min-w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as BannerStyle)}>
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="text-muted-foreground" size={16}/>
                <span>{option.label()}</span>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
