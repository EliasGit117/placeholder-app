import { forwardRef, type ComponentProps } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { type VariantProps } from 'class-variance-authority';
import { type TTailwindBreakpoint, useMediaBreakpoint } from '@/hooks/use-media-breakpoint.ts';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Icon } from '@tabler/icons-react';


interface IAdaptiveButtonProps extends Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'onClick'> {
  text: string;
  tooltipDelay?: number;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  tooltipAlign?: 'center' | 'end' | 'start';
  icon?: Icon;
  className?: string;
  disabled?: boolean;
  breakpoint?: TTailwindBreakpoint;
}

export const AdaptiveButton = forwardRef<HTMLButtonElement, IAdaptiveButtonProps>((props, ref) => {
  const {
    icon: Icon,
    className,
    text,
    size,
    variant,
    disabled,
    onClick,
    breakpoint = 'sm',
    tooltipDelay = 500,
    tooltipSide,
    tooltipAlign,
  } = props;

  const { isBelow: isCompact } = useMediaBreakpoint(breakpoint);

  const button = (
    <Button
      ref={ref}
      size={isCompact ? compactSizeMap[size ?? 'default'] : size}
      title={text}
      aria-label={text}
      variant={variant}
      disabled={disabled}
      onClick={(e) => onClick?.(e)}
      className={className}
    >
      {Icon && <Icon />}
      {!isCompact && <span>{text}</span>}
    </Button>
  );

  if (!isCompact) return button;

  return (
    <Tooltip delayDuration={tooltipDelay}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={tooltipSide} align={tooltipAlign}>
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
});

AdaptiveButton.displayName = 'AdaptiveButton';

const compactSizeMap = {
  default: 'icon',
  sm: 'icon-sm',
  xs: 'icon-xs',
  lg: 'icon-lg',
  icon: 'icon',
  'icon-xs': 'icon-xs',
  'icon-sm': 'icon-sm',
  'icon-lg': 'icon-lg'
} satisfies Record<
  NonNullable<VariantProps<typeof Button>['size']>,
  NonNullable<VariantProps<typeof Button>['size']>
>;