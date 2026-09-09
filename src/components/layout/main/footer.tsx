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


const socials: { Icon: TablerIcon; label: string }[] = [
  { Icon: IconBrandInstagram, label: 'Instagram' },
  { Icon: IconBrandFacebook, label: 'Facebook' },
  { Icon: IconBrandTiktok, label: 'TikTok' },
  { Icon: IconBrandYoutube, label: 'YouTube' }
];


const navLinks: { to: LinkOptions['to']; label: () => string }[] = [
  { to: '/', label: () => m['common.home']() },
  { to: '/products', label: () => m['pages.products.title']() },
  { to: '/terms', label: () => m['components.footer.legal']() }
];

const Eyebrow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-xs font-medium whitespace-nowrap uppercase tracking-[0.28em] text-primary">{children}</div>
);

export const SiteFooter: FC<ComponentProps<'footer'>> = ({ className, ...props }) => {
  const { data: categories, isPending } = useQuery(
    orpc.categories.getTree.queryOptions({ input: { depth: 2 } })
  );

  return (
    <footer className={cn('@container mt-auto border-t border-border bg-muted/40', className)} {...props}>
      <div className="container mx-auto grid grid-cols-2 gap-x-6 gap-y-12 px-4 py-16 @2xl:grid-cols-3 @4xl:flex @4xl:flex-row @4xl:justify-between @4xl:gap-10">

        {/* Categories */}
        <nav className="flex flex-col items-center gap-4 text-center @4xl:items-start @4xl:text-left">
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
        <nav className="flex flex-col items-center gap-4 text-center @4xl:items-start @4xl:text-left">
          <Eyebrow>{m['components.footer.navigation']()}</Eyebrow>
          <ul className="flex max-w-28 flex-col gap-3.5">
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
        <div className="col-span-2 flex flex-col items-center gap-4 text-center @2xl:col-span-1 @4xl:items-start @4xl:text-left">
          <Eyebrow>{m['components.footer.contact']()}</Eyebrow>
          <ul className="flex flex-col gap-3.5 text-[15px] text-muted-foreground">
            <li>
              <a href="tel:+37367432561" className="transition-colors hover:text-foreground">
                +373 67 432 561
              </a>
            </li>
            <li>
              <a href="mailto:pielmoldova@gmail.com" className="transition-colors hover:text-foreground">
                pielmoldova@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <div className="col-span-2 flex flex-col items-center text-center @2xl:col-span-3 @4xl:max-w-xs @4xl:items-start @4xl:text-left">
          <LogoButton/>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {m['components.footer.description']()}
          </p>
          <div className="mt-7 flex justify-center gap-3 @4xl:justify-start">
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

      <div className="@container border-t border-border">
        <div
          className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 @sm:flex-row">
          <p className="text-sm text-muted-foreground">
            {m['components.footer.copyright']({ year: new Date().getFullYear(), app: 'SKINERY SRL' })}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-white">
            {paymentLogos.map((logo) => (
              <PaymentCard key={logo} logo={logo} className="h-8.25 w-12"/>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

const paymentLogos = ['visa', 'mastercard', 'maib', 'amex'] as const;

const PaymentCard: FC<ComponentProps<'div'> & { logo: (typeof paymentLogos)[number] }> = ({
  logo,
  className,
  ...props
}) => (
  <div
    className={cn(
      'flex items-center justify-center gap-0.5 bg-white rounded-[0.15rem] overflow-hidden p-0.5',
      className
    )}
    {...props}
  >
    <img src={`/images/logos/${logo}.png`} className="h-full w-fit object-contain"/>
  </div>
);