import type { FC, ReactNode, SVGProps } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { IconMinus, IconPhotoOff, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { HeroBannerCarousel } from '@/routes/_public/-components/hero-banner-carousel';
import { ProductCard } from '@/components/product/card.tsx';
import { Skeleton } from '@/components/ui/skeleton';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { SortDirection } from '@/features/shared/schemas/pagination.ts';
import type { ICategoryNodeDto } from '@/features/categories/public/dtos/category-tree.ts';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/_public/')({
  component: App,
  staticData: { hideCrumbs: true },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      awaitIfServer(queryClient.prefetchQuery(orpc.banners.getValid.queryOptions())),
      awaitIfServer(queryClient.prefetchQuery(newArrivalsQuery)),
      awaitIfServer(queryClient.prefetchQuery(categoriesTreeQuery)),
    ]);
  },
});

function App() {
  return (
    <div className="flex-1">
      <HeroBannerCarousel className="pt-0"/>
      <About/>
      <Categories/>
      <Arrivals/>
      <Faq/>
    </div>
  );
}


const Eyebrow: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="text-xs font-medium uppercase tracking-[0.32em] text-primary">{children}</div>
);


const SectionHead: FC<{ eyebrow: string; title: ReactNode; right?: ReactNode }> = ({ eyebrow, title, right }) => (
  <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end md:gap-10">
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-2 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">{title}</h2>
    </div>
    {right && <div className="max-w-sm text-sm text-muted-foreground">{right}</div>}
  </div>
);

const Section: FC<{ className?: string; children: ReactNode }> = ({ className, children }) => (
  <section className={className}>
    <div className="container mx-auto px-4 py-20 md:py-28">{children}</div>
  </section>
);


// ─── Categories ──────────────────────────────────────────────────────────────

const categoriesTreeQuery = orpc.categories.getTree.queryOptions({ input: { depth: 1 } });

const Categories: FC = () => {
  const { data, isPending } = useQuery(categoriesTreeQuery);
  const categories = data ?? [];

  if (!isPending && categories.length === 0) return null;

  return (
    <Section className="bg-background">
      <SectionHead
        eyebrow={m['pages.home.categories.eyebrow']()}
        title={
          <>
            {m['pages.home.categories.title_prefix']()}{' '}
            <span className="italic text-primary">{m['pages.home.categories.title_highlight']()}</span>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-xl"/>
              <Skeleton className="h-4 w-2/3"/>
            </div>
          ))
        ) : (
          categories.map((category) => <CategoryCard key={category.id} category={category}/>)
        )}
      </div>
    </Section>
  );
};

const CategoryCard: FC<{ category: ICategoryNodeDto }> = ({ category }) => {
  const imageUrl = category.image?.variants.thumb512?.url ?? category.image?.url;

  return (
    <Link
      to="/products"
      search={{ categoryId: category.id }}
      className="group flex flex-col items-start gap-3 text-left"
    >
      <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={category.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <IconPhotoOff className="size-8 text-muted-foreground opacity-25"/>
        )}
      </div>
      <div>
        <div className="text-lg font-medium group-hover:text-primary">
          {category.name}
        </div>
        {category.description && (
          <p className="mt-1 line-clamp-2 text-[13px] text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
    </Link>
  );
};


// ─── New arrivals ────────────────────────────────────────────────────────────

const newArrivalsQuery = orpc.products.search.queryOptions({
  input: { page: 1, limit: 4, sort: 'createdAt', dir: SortDirection.DESC },
});

const Arrivals: FC = () => {
  const { data, isPending } = useQuery(newArrivalsQuery);
  const products = data?.items ?? [];

  return (
    <Section className="bg-background">
      <SectionHead
        eyebrow={m['pages.home.arrivals.eyebrow']()}
        title={<>{m['pages.home.arrivals.title']()}</>}
        right={
          <Button variant="link" className="h-auto p-0 text-foreground" asChild>
            <Link to="/products">{m['pages.home.arrivals.cta']()} →</Link>
          </Button>
        }
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <Skeleton className="aspect-square w-full rounded-none"/>
              <div className="space-y-3 p-4">
                <Skeleton className="h-6 w-2/3"/>
                <Skeleton className="h-9 w-full"/>
              </div>
            </div>
          ))
        ) : (
          products.map((product) => <ProductCard key={product.id} product={product}/>)
        )}
      </div>
    </Section>
  );
};


// ─── About / benefits ────────────────────────────────────────────────────────

const About: FC = () => {
  const credentials = [
    { num: '100%', lab: m['pages.home.about.credential_cruelty_free']() },
    { num: '0', lab: m['pages.home.about.credential_synthetic_fragrances']() },
    { num: '42', lab: m['pages.home.about.credential_active_ingredients']() },
  ];

  const benefits = [
    { Icon: LeafIcon, title: m['pages.home.about.benefit_1_title'](), text: m['pages.home.about.benefit_1_text']() },
    { Icon: ClockIcon, title: m['pages.home.about.benefit_2_title'](), text: m['pages.home.about.benefit_2_text']() },
    { Icon: EyeIcon, title: m['pages.home.about.benefit_3_title'](), text: m['pages.home.about.benefit_3_text']() },
    { Icon: StarIcon, title: m['pages.home.about.benefit_4_title'](), text: m['pages.home.about.benefit_4_text']() },
    { Icon: DocIcon, title: m['pages.home.about.benefit_5_title'](), text: m['pages.home.about.benefit_5_text']() },
    { Icon: DropIcon, title: m['pages.home.about.benefit_6_title'](), text: m['pages.home.about.benefit_6_text']() },
  ];

  return (
    <Section className="bg-muted/40">
      <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div>
          <Eyebrow>{m['pages.home.about.eyebrow']()}</Eyebrow>
          <h2 className="my-4 mb-7 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
            {m['pages.home.about.title_prefix']()}{' '}
            <span className="italic text-primary">{m['pages.home.about.title_highlight']()}</span>
          </h2>
          <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            {m['pages.home.about.paragraph_1']()}
          </p>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            {m['pages.home.about.paragraph_2']()}
          </p>
          <div className="mt-9 font-heading text-3xl italic text-primary">
            {m['pages.home.about.founder']()}
          </div>

          <div className="mt-10 flex gap-10 border-t border-border pt-7">
            {credentials.map((c) => (
              <div key={c.lab}>
                <div className="font-heading text-4xl font-medium leading-none text-primary">{c.num}</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{c.lab}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-6 text-card-foreground transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"/>
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"/>

              <div className="flex items-start justify-between gap-4">
                <h4 className="font-heading text-xl font-medium transition-colors duration-300 group-hover:text-primary">
                  {b.title}
                </h4>
                <div className="size-10 bg-muted rounded-full flex items-center justify-center p-2 shrink-0">
                  <b.Icon className="text-primary"/>
                </div>
              </div>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};


// ─── FAQ ─────────────────────────────────────────────────────────────────────

const Faq: FC = () => {
  const faqs = [
    { q: m['pages.home.faq.q1'](), a: m['pages.home.faq.a1']() },
    { q: m['pages.home.faq.q2'](), a: m['pages.home.faq.a2']() },
    { q: m['pages.home.faq.q3'](), a: m['pages.home.faq.a3']() },
    { q: m['pages.home.faq.q4'](), a: m['pages.home.faq.a4']() },
    { q: m['pages.home.faq.q5'](), a: m['pages.home.faq.a5']() },
    { q: m['pages.home.faq.q6'](), a: m['pages.home.faq.a6']() },
  ];

  return (
    <Section className="bg-background">
      <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <Eyebrow>{m['pages.home.faq.eyebrow']()}</Eyebrow>
          <h2 className="mt-2 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
            {m['pages.home.faq.title_prefix']()}{' '}
            <span className="italic text-primary">{m['pages.home.faq.title_highlight']()}</span>
          </h2>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {m['pages.home.faq.description']()}
          </p>
        </div>

        <AccordionPrimitive.Root type="single" collapsible defaultValue="faq-0" className="border-t border-border">
          {faqs.map((f, i) => (
            <AccordionPrimitive.Item key={f.q} value={`faq-${i}`} className="border-b border-border">
              <AccordionPrimitive.Header className="flex">
                <AccordionPrimitive.Trigger className="group flex flex-1 items-center justify-between gap-6 py-6 text-left outline-none">
                  <span className="font-heading text-xl leading-snug transition-colors group-aria-expanded:text-primary sm:text-2xl">
                    {f.q}
                  </span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-primary transition-colors group-aria-expanded:border-primary group-aria-expanded:bg-primary group-aria-expanded:text-primary-foreground">
                    <IconPlus className="size-4 group-aria-expanded:hidden"/>
                    <IconMinus className="hidden size-4 group-aria-expanded:block"/>
                  </span>
                </AccordionPrimitive.Trigger>
              </AccordionPrimitive.Header>
              <AccordionPrimitive.Content className="overflow-hidden data-open:animate-accordion-down data-closed:animate-accordion-up">
                <p className="max-w-2xl pb-6 text-[15px] leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </AccordionPrimitive.Content>
            </AccordionPrimitive.Item>
          ))}
        </AccordionPrimitive.Root>
      </div>
    </Section>
  );
};


// ─── Icons (inline, inherit currentColor) ────────────────────────────────────

type IcProps = SVGProps<SVGSVGElement>;
const stroke = (p: IcProps) => ({ fill: 'none', stroke: 'currentColor', strokeWidth: 1.4, ...p });

function LeafIcon(p: IcProps) {
  return <svg viewBox="0 0 44 44" {...stroke(p)}>
    <path d="M22 6 C 14 14, 12 22, 16 30 C 20 38, 28 36, 30 28 C 32 18, 28 10, 22 6 z"/>
    <path d="M22 14 V 32"/>
  </svg>;
}

function ClockIcon(p: IcProps) {
  return <svg viewBox="0 0 44 44" {...stroke(p)}>
    <circle cx="22" cy="22" r="14"/>
    <path d="M22 8 V 22 L 30 30"/>
    <circle cx="22" cy="22" r="2" fill="currentColor"/>
  </svg>;
}

function EyeIcon(p: IcProps) {
  return <svg viewBox="0 0 44 44" {...stroke(p)}>
    <path d="M8 22 C 14 14, 30 14, 36 22 C 30 30, 14 30, 8 22 z"/>
    <circle cx="22" cy="22" r="5"/>
    <circle cx="22" cy="22" r="2" fill="currentColor"/>
  </svg>;
}

function StarIcon(p: IcProps) {
  return <svg viewBox="0 0 44 44" {...stroke(p)}>
    <path d="M22 6 L 28 18 L 40 20 L 30 28 L 32 40 L 22 34 L 12 40 L 14 28 L 4 20 L 16 18 z"/>
  </svg>;
}

function DocIcon(p: IcProps) {
  return <svg viewBox="0 0 44 44" {...stroke(p)}>
    <rect x="10" y="14" width="24" height="22" rx="1"/>
    <path d="M14 14 V 10 H 30 V 14"/>
    <path d="M16 22 H 28 M 16 28 H 28 M 16 34 H 24"/>
  </svg>;
}

function DropIcon(p: IcProps) {
  return <svg viewBox="0 0 44 44" {...stroke(p)}>
    <path d="M22 8 C 28 14, 30 22, 22 36 C 14 22, 16 14, 22 8 z"/>
    <path d="M22 20 V 30"/>
  </svg>;
}
