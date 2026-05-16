import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { IconFilePlus, type Icon } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { useCategorySheetActions, type TCategorySheetOptions } from './provider.tsx';
import { Slot } from '@radix-ui/react-slot';
import { AdaptiveButton } from '@/components/ui/adaptive-button.tsx';
import type { TTailwindBreakpoint } from '@/hooks/use-media-breakpoint.ts';

interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  text?: string;
  icon?: Icon;
  options: TCategorySheetOptions;
  tooltipAlign?: 'center' | 'end' | 'start';
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  breakpoint?: TTailwindBreakpoint;
}

export const CategorySheetTrigger: FC<IProps> = ({ ...props }) => {
  const {
    children,
    text = m['common.create'](),
    asChild = false,
    size,
    breakpoint,
    tooltipSide,
    tooltipAlign,
    options,
    icon: Icon = IconFilePlus,
    ...btnProps
  } = props;

  const { open } = useCategorySheetActions();

  if (children && asChild)
    return (
      <Slot onClick={() => open(options)}>
        {children}
      </Slot>
    );

  return (
    <AdaptiveButton
      icon={Icon}
      text={text}
      size={size}
      onClick={() => open(options)}
      breakpoint={breakpoint}
      tooltipSide={tooltipSide}
      tooltipAlign={tooltipAlign}
      {...btnProps}
    />
  );
};

