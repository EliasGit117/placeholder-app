import { type ComponentProps, type FC } from 'react';
import { IconPlus, type Icon } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { AdaptiveButton } from '@/components/ui/adaptive-button.tsx';
import type { TTailwindBreakpoint } from '@/hooks/use-media-breakpoint.ts';
import { m } from '@/paraglide/messages';
import { BrandSheetMode, useBrandSheet } from './provider.tsx';

interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  text?: string;
  icon?: Icon;
  tooltipAlign?: 'center' | 'end' | 'start';
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  breakpoint?: TTailwindBreakpoint;
}

export const BrandSheetTrigger: FC<IProps> = (props) => {
  const {
    text = m['pages.brands.index.create'](),
    icon: Icon = IconPlus,
    size,
    breakpoint,
    tooltipSide,
    tooltipAlign,
    ...btnProps
  } = props;

  const { open } = useBrandSheet();

  return (
    <AdaptiveButton
      icon={Icon}
      text={text}
      size={size}
      onClick={() => open({ mode: BrandSheetMode.Create })}
      breakpoint={breakpoint}
      tooltipSide={tooltipSide}
      tooltipAlign={tooltipAlign}
      {...btnProps}
    />
  );
};
