import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { IconArrowsSort, type Icon } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { useBannerReorderSheet } from './provider.tsx';
import { Slot } from '@radix-ui/react-slot';
import { AdaptiveButton } from '@/components/ui/adaptive-button.tsx';
import type { TTailwindBreakpoint } from '@/hooks/use-media-breakpoint.ts';

interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  text?: string;
  icon?: Icon;
  tooltipAlign?: 'center' | 'end' | 'start';
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  breakpoint?: TTailwindBreakpoint;
}

export const BannerReorderSheetTrigger: FC<IProps> = ({ ...props }) => {
  const {
    children,
    text = m['pages.banners.index.reorder'](),
    asChild = false,
    size,
    breakpoint,
    tooltipSide,
    tooltipAlign,
    icon: Icon = IconArrowsSort,
    ...btnProps
  } = props;

  const { open } = useBannerReorderSheet();

  if (children && asChild)
    return (
      <Slot onClick={() => open()}>
        {children}
      </Slot>
    );

  return (
    <AdaptiveButton
      icon={Icon}
      text={text}
      size={size}
      onClick={() => open()}
      breakpoint={breakpoint}
      tooltipSide={tooltipSide}
      tooltipAlign={tooltipAlign}
      {...btnProps}
    />
  );
};
