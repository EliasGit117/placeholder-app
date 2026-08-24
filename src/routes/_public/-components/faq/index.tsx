import type { FC } from 'react';
import { Accordion as AccordionPrimitive } from 'radix-ui';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { Eyebrow, Section } from '@/routes/_public/-components/shared';

export const Faq: FC = () => {
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
