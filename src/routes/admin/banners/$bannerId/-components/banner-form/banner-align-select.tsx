import type { FC } from 'react';
import {
  IconChevronDown,
  IconLayoutAlignBottom,
  IconLayoutAlignCenter,
  IconLayoutAlignLeft,
  IconLayoutAlignMiddle,
  IconLayoutAlignRight,
  IconLayoutAlignTop,
  type TablerIcon,
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx';
import { Button } from '@/components/ui/button.tsx';
import { m } from '@/paraglide/messages';
import { BannerXAlign, BannerYAlign } from '~/prisma/generated/prisma/enums.ts';


interface IOption {
  value: string;
  label: () => string;
  icon: TablerIcon;
}

const xOptions: IOption[] = [
  { value: BannerXAlign.LEFT, label: () => m['pages.banners.detail.align_left'](), icon: IconLayoutAlignLeft },
  { value: BannerXAlign.CENTER, label: () => m['pages.banners.detail.align_center'](), icon: IconLayoutAlignCenter },
  { value: BannerXAlign.RIGHT, label: () => m['pages.banners.detail.align_right'](), icon: IconLayoutAlignRight },
];

const yOptions: IOption[] = [
  { value: BannerYAlign.TOP, label: () => m['pages.banners.detail.align_top'](), icon: IconLayoutAlignTop },
  { value: BannerYAlign.CENTER, label: () => m['pages.banners.detail.align_center'](), icon: IconLayoutAlignMiddle },
  { value: BannerYAlign.BOTTOM, label: () => m['pages.banners.detail.align_bottom'](), icon: IconLayoutAlignBottom },
];

interface IProps {
  axis: 'x' | 'y';
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const BannerAlignSelect: FC<IProps> = ({ axis, value, onChange, disabled }) => {
  const options = axis === 'x' ? xOptions : yOptions;
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
      <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
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
