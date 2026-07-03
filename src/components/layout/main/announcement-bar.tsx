import type { ComponentProps, FC } from 'react';
import { IconStarFilled } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';

/**
 * Skinery top announcement strip — localized promo messages, theme-token styled.
 * Sits above the (sticky) Header in the public MainLayout and is NOT sticky, so
 * it scrolls away on scroll.
 */

export const AnnouncementBar: FC<ComponentProps<'div'>> = ({ className, ...props }) => {
  // Built inside render so the messages track the active locale.
  const messages = [
    m['components.announcement_bar.free_shipping'](),
    m['components.announcement_bar.botanical'](),
    m['components.announcement_bar.new_serum']()
  ];

  return (
  <div className={cn('@container border-b border-border/25 bg-muted/40 h-8 flex items-center', className)} {...props}>
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
};
