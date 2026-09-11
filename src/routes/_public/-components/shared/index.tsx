import type { FC, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * The page's one botanical flourish — used once (About), not repeated
 * per-section. Sits in the top padding gutter, above and clear of the
 * heading, so it never competes with content.
 */
export const BotanicalAccent: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 200 300"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    className={cn('pointer-events-none absolute right-6 top-0 hidden w-28 -translate-y-1/2 rotate-12 text-primary/20 sm:block', className)}
  >
    <path d="M100 290 C 100 240, 100 180, 100 60"/>
    <path d="M100 250 C 70 230, 50 220, 30 210"/>
    <path d="M100 220 C 130 200, 150 195, 175 185"/>
    <path d="M100 180 C 70 160, 50 150, 30 140"/>
    <path d="M100 150 C 130 130, 150 120, 175 110"/>
    <path d="M100 110 C 70 90, 60 78, 50 60"/>
    <path d="M100 80 C 125 60, 140 50, 160 35"/>
    <ellipse cx="100" cy="55" rx="14" ry="22" transform="rotate(15 100 55)"/>
    <ellipse cx="40" cy="135" rx="14" ry="22" transform="rotate(-40 40 135)"/>
    <ellipse cx="165" cy="105" rx="14" ry="22" transform="rotate(50 165 105)"/>
  </svg>
);

export const Eyebrow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-xs font-medium uppercase tracking-[0.32em] text-primary">{children}</div>
);

export const SectionHead: FC<{ eyebrow: string; title: ReactNode; right?: ReactNode }> = ({ eyebrow, title, right }) => (
  <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-10">
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
    </div>
    {right && <div className="max-w-sm text-sm text-muted-foreground">{right}</div>}
  </div>
);

export const Section: FC<{ className?: string; children: ReactNode }> = ({ className, children }) => (
  <section className={cn('relative overflow-hidden', className)}>
    <div className="container relative mx-auto px-4 py-20 md:py-28">{children}</div>
  </section>
);
