import type { SVGProps } from 'react';

export const IconBotanicalWaves = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={1.2} {...props}>
    <circle cx="100" cy="100" r="80"/>
    <path d="M20 100 C 50 80, 80 80, 100 100 C 120 120, 150 120, 180 100"/>
    <path d="M20 100 C 50 120, 80 120, 100 100 C 120 80, 150 80, 180 100"/>
    <path d="M100 20 C 80 50, 80 80, 100 100 C 120 120, 120 150, 100 180"/>
  </svg>
);
