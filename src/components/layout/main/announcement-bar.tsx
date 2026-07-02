import type { ComponentProps, FC } from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

/**
 * Skinery top announcement strip — static promo messages, theme-token styled.
 * Sits above the (sticky) Header in the public MainLayout and is NOT sticky, so
 * it scrolls away on scroll.
 */

const messages = [
  'Livrare gratuită la comenzi peste 500 lei',
  'Cosmetică botanică, formule curate',
  'Nou: ser cu acid hialuronic' 
];

export const AnnouncementBar: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
  <div className={cn('@container border-b border-border/25 bg-muted/40', className)} {...props}>
    <div className="scroll-fade-x container mx-auto flex items-center justify-start gap-6 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden @5xl:justify-center">
      {messages.map((msg) => (
        <div key={msg} className="flex shrink-0 items-center gap-6">
          <IconStarFilled className="size-2.5 text-primary" aria-hidden/>
          <span className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {msg}
          </span>
        </div>
      ))}
    </div>
  </div>
);
