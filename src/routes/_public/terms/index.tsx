import { createFileRoute } from '@tanstack/react-router';
import { type CSSProperties, type FC, useRef } from 'react';
import { m } from '@/paraglide/messages';
import { Eyebrow } from '@/routes/_public/-components/shared';
import { TermsToc } from '@/routes/_public/terms/-components/toc';

export const Route = createFileRoute('/_public/terms/')({
  staticData: { hideCrumbs: true },
  component: RouteComponent,
});

const Paragraphs: FC<{ text: string }> = ({ text }) => (
  <>
    {text.split('\n\n').map((paragraph, index) => (
      <p key={index}>{paragraph}</p>
    ))}
  </>
);

const sections = [
  { title: () => m['pages.terms.s1_title'](), body: () => m['pages.terms.s1_body']() },
  { title: () => m['pages.terms.s2_title'](), body: () => m['pages.terms.s2_body']() },
  { title: () => m['pages.terms.s3_title'](), body: () => m['pages.terms.s3_body']() },
  { title: () => m['pages.terms.s4_title'](), body: () => m['pages.terms.s4_body']() },
  { title: () => m['pages.terms.s5_title'](), body: () => m['pages.terms.s5_body']() },
  { title: () => m['pages.terms.s6_title'](), body: () => m['pages.terms.s6_body']() },
  { title: () => m['pages.terms.s7_title'](), body: null },
];

function RouteComponent() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 pt-8 pb-20 md:pb-28">
        <Eyebrow>{m['components.footer.legal']()}</Eyebrow>
        <h1 className="mt-2 font-heading text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl">
          {m['pages.terms.title']()}
        </h1>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div
            className="prose order-2 max-w-3xl lg:order-1"
            style={{
              '--tw-prose-body': 'var(--muted-foreground)',
              '--tw-prose-headings': 'var(--foreground)',
              '--tw-prose-bold': 'var(--foreground)',
              '--tw-prose-links': 'var(--primary)',
              '--tw-prose-bullets': 'var(--muted-foreground)',
            } as CSSProperties}
          >
            <Paragraphs text={m['pages.terms.intro']()}/>

            {sections.map((section, index) => (
              <div key={index} ref={(el) => { sectionRefs.current[index] = el; }}>
                <h2 className="scroll-mt-24 font-heading font-normal tracking-tight">{section.title()}</h2>
                {section.body ? (
                  <Paragraphs text={section.body()}/>
                ) : (
                  <ul>
                    <li><strong>{m['pages.terms.s7_company_label']()}:</strong> {m['pages.terms.s7_company_value']()}</li>
                    <li><strong>{m['pages.terms.s7_legal_address_label']()}:</strong> {m['pages.terms.s7_legal_address_value']()}</li>
                    <li><strong>{m['pages.terms.s7_physical_address_label']()}:</strong> {m['pages.terms.s7_physical_address_value']()}</li>
                    <li>
                      <strong>{m['pages.terms.s7_phone_label']()}:</strong>{' '}
                      <a href="tel:+37367432561">+373 67 432 561</a>
                    </li>
                    <li>
                      <strong>{m['pages.terms.s7_email_label']()}:</strong>{' '}
                      <a href="mailto:pielmoldova@gmail.com">pielmoldova@gmail.com</a>
                    </li>
                  </ul>
                )}
              </div>
            ))}
          </div>

          <TermsToc sections={sections} sectionRefs={sectionRefs}/>
        </div>
      </div>
    </section>
  );
}
