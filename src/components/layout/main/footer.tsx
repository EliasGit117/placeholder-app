import type { ComponentProps, FC, ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  type TablerIcon
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { LogoButton } from '@/components/layout/common/logo-button.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Skinery marketing footer — static content (no backend), theme-token styled so
 * it follows the design system. Used by the public MainLayout only; admin/auth
 * keep the minimal common Footer.
 */

interface IFooterColumn {
  title: string;
  links: string[];
}

const columns: IFooterColumn[] = [
  {
    title: 'Магазин',
    links: ['Уход за волосами', 'Уход за кожей', 'Микроинъекции', 'Seturi & Cadouri', 'Ediții limitate']
  },
  {
    title: 'Компания',
    links: ['Povestea noastră', 'Atelierul', 'Sustenabilitate', 'Jurnal', 'Cariere']
  },
  {
    title: 'Поддержка',
    links: ['Livrare & retur', 'Întrebări frecvente', 'Card cadou', 'Contact', 'Termeni & condiții']
  }
];

const socials: { Icon: TablerIcon; label: string }[] = [
  { Icon: IconBrandInstagram, label: 'Instagram' },
  { Icon: IconBrandFacebook, label: 'Facebook' },
  { Icon: IconBrandTiktok, label: 'TikTok' },
  { Icon: IconBrandYoutube, label: 'YouTube' }
];

const payments = ['Visa', 'Mastercard', 'MAIB Pay', 'Apple Pay'];

const Eyebrow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-xs font-medium uppercase tracking-[0.28em] text-primary">{children}</div>
);

export const SiteFooter: FC<ComponentProps<'footer'>> = ({ className, ...props }) => (
  <footer className={cn('mt-auto border-t border-border bg-muted/40', className)} {...props}>
    <div className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:gap-10">
      {/* Brand */}
      <div>
        <LogoButton/>
        <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Cosmetică botanică formulată în Chișinău. Pentru ritualuri zilnice și piele care respiră.
        </p>
        <div className="mt-7 flex gap-3">
          {socials.map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="size-4"/>
            </a>
          ))}
        </div>
      </div>

      {/* Link columns */}
      {columns.map((col) => (
        <nav key={col.title} className="flex flex-col gap-4">
          <Eyebrow>{col.title}</Eyebrow>
          <ul className="flex flex-col gap-3.5">
            {col.links.map((link) => (
              <li key={link}>
                <Link
                  to="/"
                  className="text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}

      {/* Newsletter */}
      <div className="flex flex-col gap-4">
        <Eyebrow>Newsletter</Eyebrow>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Ritualuri, produse noi și -10% la prima comandă.
        </p>
        <form className="flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
          <Input type="email" placeholder="adresa@email.md" className="rounded-none bg-background/50"/>
          <Button type="submit" className="rounded-none uppercase tracking-[0.12em]">
            Abonare
          </Button>
        </form>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Atelier · str. Mihai Eminescu 12, Chișinău
        </p>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-border">
      <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Skinery SRL. Toate drepturile rezervate.
        </p>
        <div className="flex flex-wrap gap-2">
          {payments.map((p) => (
            <span
              key={p}
              className="rounded-none border border-border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  </footer>
);
