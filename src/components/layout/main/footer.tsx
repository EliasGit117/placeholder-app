import type { ComponentProps, FC, ReactNode } from 'react';
import { Link, type LinkOptions } from '@tanstack/react-router';
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandTiktok,
  IconBrandYoutube,
  type TablerIcon
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { LogoButton } from '@/components/layout/common/logo-button.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { m } from '@/paraglide/messages';
import VisaIcon from '@/assets/icons/payment/visa.svg?react';
import MastercardIcon from '@/assets/icons/payment/mastercard.svg?react';
import ApplePayIcon from '@/assets/icons/payment/apple-pay.svg?react';


const socials: { Icon: TablerIcon; label: string }[] = [
  { Icon: IconBrandInstagram, label: 'Instagram' },
  { Icon: IconBrandFacebook, label: 'Facebook' },
  { Icon: IconBrandTiktok, label: 'TikTok' },
  { Icon: IconBrandYoutube, label: 'YouTube' }
];


const navLinks: { to: LinkOptions['to']; label: () => string }[] = [
  { to: '/', label: () => m['common.home']() },
  { to: '/products', label: () => m['pages.products.title']() }
];

const Eyebrow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-xs font-medium uppercase tracking-[0.28em] text-primary">{children}</div>
);

export const SiteFooter: FC<ComponentProps<'footer'>> = ({ className, ...props }) => {
  const { data: categories, isPending } = useQuery(
    orpc.categories.getTree.queryOptions({ input: { depth: 2 } })
  );

  return (
    <footer className={cn('mt-auto border-t border-border bg-muted/40', className)} {...props}>
      <div className="container mx-auto flex flex-col gap-12 px-4 py-16 lg:flex-row lg:justify-between lg:gap-10">

        {/* Categories */}
        <nav className="flex flex-col gap-4">
          <Eyebrow>{m['components.header.categories']()}</Eyebrow>
          <ul className="flex flex-col gap-3.5">
            {isPending ? (
              Array.from({ length: 6 }).map((_, i) => (
                <li key={i}>
                  <Skeleton className="h-6" style={{ width: `${60 + ((i * 17) % 35)}%` }}/>
                </li>
              ))
            ) : (
              categories?.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/"
                    className="text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>

        {/* Navigation */}
        <nav className="flex flex-col gap-4">
          <Eyebrow>{m['components.footer.navigation']()}</Eyebrow>
          <ul className="flex flex-col gap-3.5">
            {navLinks.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label()}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="flex flex-col gap-4">
          <Eyebrow>{m['components.footer.contact']()}</Eyebrow>
          <ul className="flex flex-col gap-3.5 text-[15px] text-muted-foreground">
            <li>
              <a href="tel:+37322123456" className="transition-colors hover:text-foreground">
                +373 22 123 456
              </a>
            </li>
            <li>
              <a href="mailto:hello@skinery.md" className="transition-colors hover:text-foreground">
                hello@skinery.md
              </a>
            </li>
          </ul>
        </div>

        <div className="lg:max-w-xs">
          <LogoButton/>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {m['components.footer.description']()}
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
          <p className="mt-7 text-[13px] text-muted-foreground">
            {m['components.footer.address']()}
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div
          className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {m['components.footer.copyright']({ year: new Date().getFullYear(), app: 'Skinery SRL' })}
          </p>
          <div className="flex flex-wrap gap-2 text-foreground">
            <VisaIcon className="h-12 w-fit"/>
            <MastercardIcon className="h-12 w-fit"/>
            <ApplePayIcon className="h-12 w-fit"/>
          </div>
        </div>
      </div>
    </footer>
  );
};
