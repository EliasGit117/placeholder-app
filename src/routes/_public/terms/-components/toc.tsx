import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ITocSection {
  title: () => string;
}

const HEADER_OFFSET = 80;

interface IProps {
  sections: ITocSection[];
  sectionRefs: MutableRefObject<(HTMLElement | null)[]>;
}

export function TermsToc({ sections, sectionRefs }: IProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const scrollToSection = (index: number) => {
    const el = sectionRefs.current[index];
    if (!el)
      return;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  useEffect(() => {
    const elements = sectionRefs.current.filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting)
            continue;
          const index = elements.indexOf(entry.target as HTMLElement);
          if (index !== -1)
            setActiveIndex(index);
        }
      },
      { rootMargin: `-${HEADER_OFFSET + 16}px 0px -70% 0px`, threshold: 0 }
    );
    observerRef.current = observer;

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionRefs]);

  return (
    <nav className="order-1 hidden lg:order-2 lg:block">
      <div className="top-24 flex flex-col gap-1 lg:sticky">
        {sections.map((section, index) => (
          <button
            key={index}
            type="button"
            onClick={() => scrollToSection(index)}
            className={cn(
              'rounded-md px-3 py-2 text-left text-[13px] leading-snug transition-colors',
              activeIndex === index ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {section.title()}
          </button>
        ))}
      </div>
    </nav>
  );
}
