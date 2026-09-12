import type { FC } from 'react';
import { m } from '@/paraglide/messages';
import { Eyebrow, Section } from '@/routes/_public/-components/shared';
import { IconClipboardData, IconClock, IconDroplet, IconEye, IconLeaf, IconStar } from '@tabler/icons-react';
import { IconBotanicalBranch } from '@/components/icons/botanical-branch';
import { IconBotanicalWaves } from '@/components/icons/botanical-waves';


export const About: FC = () => {
  const credentials = [
    { num: '100%', lab: m['pages.home.about.credential_cruelty_free']() },
    { num: '0', lab: m['pages.home.about.credential_synthetic_fragrances']() },
    { num: '42', lab: m['pages.home.about.credential_active_ingredients']() }
  ];

  const benefits = [
    { Icon: IconLeaf, title: m['pages.home.about.benefit_1_title'](), text: m['pages.home.about.benefit_1_text']() },
    { Icon: IconClock, title: m['pages.home.about.benefit_2_title'](), text: m['pages.home.about.benefit_2_text']() },
    { Icon: IconEye, title: m['pages.home.about.benefit_3_title'](), text: m['pages.home.about.benefit_3_text']() },
    { Icon: IconStar, title: m['pages.home.about.benefit_4_title'](), text: m['pages.home.about.benefit_4_text']() },
    {
      Icon: IconClipboardData,
      title: m['pages.home.about.benefit_5_title'](),
      text: m['pages.home.about.benefit_5_text']()
    },
    { Icon: IconDroplet, title: m['pages.home.about.benefit_6_title'](), text: m['pages.home.about.benefit_6_text']() }
  ];

  return (
    <Section
      className="bg-muted/40"
      decorations={
        <>
          <IconBotanicalBranch
            className="pointer-events-none absolute left-[-60px] top-10 hidden w-[280px] rotate-[-12deg] text-primary opacity-[0.18] lg:block"
          />
          <IconBotanicalWaves
            className="pointer-events-none absolute bottom-[-160px] right-0 hidden w-[380px] rotate-[20deg] text-primary opacity-[0.12] lg:block"
          />
        </>
      }
    >
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

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border bg-card p-6 text-card-foreground transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"/>
              <div
                className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"/>

              <div className="flex items-center justify-between gap-4">
                <h4
                  className="font-heading text-xl font-medium transition-colors duration-300 group-hover:text-primary">
                  {b.title}
                </h4>
                <div className="size-10 bg-muted rounded-full flex items-center justify-center p-2 shrink-0">
                  <b.Icon className="text-primary" strokeWidth={1.4}/>
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

