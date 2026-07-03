import type { FC, ReactNode, SVGProps } from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeroBannerCarousel } from '@/routes/_public/-components/hero-banner-carousel';


export const SkineryLanding: FC = () => (
  <div className="flex-1">
    <HeroBannerCarousel className="pt-0"/>
    <About/>
    <Arrivals/>
    <Faq/>
  </div>
);


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


// ─── New arrivals ────────────────────────────────────────────────────────────

interface IProduct {
  cat: string;
  name: string;
  desc: string;
  reviews: string;
  price: ReactNode;
  tag?: { label: string; variant?: 'default' | 'secondary' };
  solid?: boolean;
}

function Lei() {
  return <small className="text-[13px] font-normal text-muted-foreground">lei</small>;
}

const products: IProduct[] = [
  {
    cat: 'Уход за кожей',
    name: 'Ser Botanic Renew',
    desc: 'Concentrat de vitamina C și extract de măslin verde.',
    reviews: '(124)',
    price: <>680 <Lei/></>,
    tag: { label: 'Nou' }
  },
  {
    cat: 'Уход за волосами',
    name: 'Ulei Reparator Argan',
    desc: 'Pentru păr deteriorat, cu cheratină vegetală.',
    reviews: '(88)',
    price: <><s className="mr-1.5 text-sm font-normal text-muted-foreground">540</s>432 <Lei/></>,
    tag: { label: '-20%', variant: 'secondary' }
  },
  {
    cat: 'Микроинъекции',
    name: 'Mezo Complex Acid',
    desc: 'Acid hialuronic stabilizat, fiole 5×2ml.',
    reviews: '(56)',
    price: <>1.240 <Lei/></>,
    solid: true
  },
  {
    cat: 'Уход за кожей',
    name: 'Cremă Noapte Velvet',
    desc: 'Retinol botanic și unt de karité organic.',
    reviews: '(212)',
    price: <>820 <Lei/></>,
    tag: { label: 'Nou' }
  }
];

const Arrivals: FC = () => (
  <Section className="bg-background">
    <SectionHead
      eyebrow="Новые поступления"
      title={<>Sosite în atelier această săptămână.</>}
      right={<Button variant="link" className="h-auto p-0 text-foreground">Vezi toate produsele →</Button>}
    />

    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => (
        <article key={p.name}
                 className="flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
          <div
            className="ph-stripes relative grid aspect-[1/1.05] place-items-center border-b border-border bg-muted font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {p.tag && (
              <Badge
                className="absolute left-3.5 top-3.5 rounded-none bg-primary text-[10px] uppercase tracking-[0.18em] text-primary-foreground hover:bg-primary/90">
                {p.tag.label}
              </Badge>
            )}
            <button
              className="absolute right-3.5 top-3.5 grid size-8 place-items-center rounded-full border border-border bg-background/70 text-[13px] text-primary">
              ♡
            </button>
            Product · 320 × 340
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary">{p.cat}</div>
            <h4 className="my-1.5 font-heading text-2xl font-medium">{p.name}</h4>
            <div className="min-h-9.5 text-[13px] text-muted-foreground">{p.desc}</div>
            <div className="mt-1.5 text-[11px] tracking-[2px] text-primary">
              ★★★★★ <span className="text-muted-foreground">{p.reviews}</span>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
              <div className="font-heading text-2xl font-semibold">{p.price}</div>
              <Button size="sm" variant={p.solid ? 'default' : 'outline'}>В корзину</Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  </Section>
);


// ─── About / benefits ────────────────────────────────────────────────────────

const credentials = [
  { num: '100%', lab: 'Cruelty-free' },
  { num: '0', lab: 'Parfumuri sintetice' },
  { num: '42', lab: 'Ingrediente active' }
];

const benefits = [
  {
    Icon: LeafIcon,
    title: 'Creștere capilară',
    text: 'Stimulează foliculii cu extract de rozmarin și peptide vegetale clinic testate.'
  },
  {
    Icon: ClockIcon,
    title: 'Scalp echilibrat',
    text: 'Reglează producția de sebum și calmează scalpul sensibil în 14 zile.'
  },
  {
    Icon: EyeIcon,
    title: 'Strălucire vizibilă',
    text: 'Activează luminozitatea naturală a tenului cu acizi blânzi și vitamina C botanică.'
  },
  {
    Icon: StarIcon,
    title: 'Premiată internațional',
    text: 'Trei distincții la Clean Beauty Awards și Pure Beauty Global, 2023–2025.'
  },
  {
    Icon: DocIcon,
    title: 'Formule trasabile',
    text: 'Fiecare ingredient activ are origine documentată și certificat de proveniență.'
  },
  {
    Icon: DropIcon,
    title: 'Hidratare profundă',
    text: 'Acid hialuronic în trei greutăți moleculare pentru hidratare la toate nivelurile.'
  }
];

const About: FC = () => (
  <Section className="bg-muted/40">
    <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
      <div>
        <Eyebrow>Despre noi</Eyebrow>
        <h2 className="my-4 mb-7 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
          Frumusețea cultivată cu <span className="italic text-primary">răbdare.</span>
        </h2>
        <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Skinery s-a născut dintr-o convingere simplă: pielea și părul nostru merită mai mult decât compromisuri.
          Începând din 2018, formulăm produse într-un atelier din Chișinău, alături de farmaciști și cosmetologi care
          cred în puterea botanicii și a științei aplicate cu grijă.
        </p>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
          Fiecare flacon trece prin patruzeci de verificări înainte să ajungă la tine. Niciodată mai puțin.
        </p>
        <div className="mt-9 font-heading text-3xl italic text-primary">— Veronica Țurcanu, fondator</div>

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


// ─── FAQ ─────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'În cât timp livrați comenzile în Chișinău?',
    a: 'Comenzile plasate până la 14:00 se livrează în aceeași zi în Chișinău. Restul Moldovei: 24–48h prin curier Nova Poshta sau Posta Moldovei.'
  },
  {
    q: 'Pot returna un produs deschis?',
    a: 'Da, în termen de 14 zile, dacă produsul a fost folosit rezonabil pentru testare. Rambursăm integral valoarea comenzii.'
  },
  {
    q: 'Cum funcționează consultația cu cosmetologul?',
    a: 'Programezi o sesiune online gratuită de 20 de minute, în care analizăm tipul de piele și îți recomandăm un ritual personalizat.'
  },
  {
    q: 'Faceți livrări în România?',
    a: 'Da, livrăm în toată România prin curier, în 3–5 zile lucrătoare. Taxele vamale sunt incluse în prețul afișat.'
  },
  {
    q: 'Produsele sunt testate pe animale?',
    a: 'Niciodată. Toate formulele sunt 100% cruelty-free și certificate, testate exclusiv dermatologic pe voluntari.'
  },
  {
    q: 'Aveți eșantioane gratuite?',
    a: 'Adăugăm câte două eșantioane la fiecare comandă, alese în funcție de tipul tău de piele indicat la checkout.'
  }
];

const Faq: FC = () => (
  <Section className="bg-background">
    <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
      <div className="lg:sticky lg:top-28">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="mt-2 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
          Întrebări <span className="italic text-primary">frecvente.</span>
        </h2>
        <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Nu ai găsit răspunsul? Scrie-ne pe formularul de mai sus și revenim în câteva ore.
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


// ─── Newsletter strip (kept from footer area, theme-styled) ───────────────────
// (Site footer is provided by MainLayout; only a CTA strip lives on the page.)


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
