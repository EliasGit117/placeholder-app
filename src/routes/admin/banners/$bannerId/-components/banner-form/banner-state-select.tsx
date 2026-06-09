import type { FC } from 'react';
import { IconChevronDown, IconCircleCheck, IconEyeOff, type TablerIcon } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { m } from '@/paraglide/messages';
import { BannerState } from '~/prisma/generated/prisma/enums.ts';


const options: { value: BannerState; label: () => string; icon: TablerIcon }[] = [
  { value: BannerState.active, label: () => m['pages.banners.detail.state_active'](), icon: IconCircleCheck },
  { value: BannerState.hidden, label: () => m['pages.banners.detail.state_hidden'](), icon: IconEyeOff },
];

interface IProps {
  value: BannerState;
  onChange: (value: BannerState) => void;
  disabled?: boolean;
}

export const BannerStateSelect: FC<IProps> = ({ value, onChange, disabled }) => {
  const current = options.find((o) => o.value === value) ?? options[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-start" disabled={disabled}>
          <CurrentIcon className="text-muted-foreground" size={16}/>
          <span>{current.label()}</span>
          <IconChevronDown className="ml-auto opacity-50" size={16}/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value} onValueChange={(v) => onChange(v as BannerState)}>
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
