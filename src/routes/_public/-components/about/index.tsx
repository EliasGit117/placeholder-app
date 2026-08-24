import type { FC, SVGProps } from 'react';
import { m } from '@/paraglide/messages';
import { Eyebrow, Section } from '@/routes/_public/-components/shared';

export const About: FC = () => {
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
