import { type FC, useEffect, useRef } from 'react';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';


const WHATSAPP_NUMBER = '37367432561';

export const WhatsAppButton: FC<{ className?: string }> = ({ className }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  // Lift the button by however much the footer has scrolled into view, so it
  // rests on top of the footer instead of overlapping it.
  useEffect(() => {
    const update = () => {
      const footer = document.querySelector('footer');
      const el = ref.current;
      if (!footer || !el) return;

      const overlap = Math.max(0, window.innerHeight - footer.getBoundingClientRect().top);
      el.style.transform = overlap > 0 ? `translateY(-${overlap}px)` : '';
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
  <a
    ref={ref}
    href={`https://wa.me/${WHATSAPP_NUMBER}`}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={m['common.contact_whatsapp']()}
    title={m['common.contact_whatsapp']()}
    className={cn(
      // z-20: stays below the sticky header (z-30)
      'fixed bottom-4 right-4 z-20 flex size-10 items-center justify-center rounded-full',
      'border border-white/25 bg-[#128C7E] text-white shadow-lg transition-colors hover:bg-[#0E6F64] focus-visible:outline-2 focus-visible:outline-offset-2',
      'sm:bottom-5 sm:right-5 sm:size-11',
      className
    )}
  >
    <IconBrandWhatsapp className="size-5 sm:size-6" strokeWidth={1.6}/>
  </a>
  );
};
