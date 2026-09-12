import type { SVGProps } from 'react';

export const IconBotanicalBranch = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 300" fill="none" stroke="currentColor" strokeWidth={1.2} {...props}>
    <path d="M100 290 C 100 240, 100 180, 100 60"/>
    <path d="M100 250 C 70 230, 50 220, 30 210"/>
    <path d="M100 220 C 130 200, 150 195, 175 185"/>
    <path d="M100 180 C 70 160, 50 150, 30 140"/>
    <path d="M100 150 C 130 130, 150 120, 175 110"/>
    <path d="M100 110 C 70 90, 60 78, 50 60"/>
    <path d="M100 80 C 125 60, 140 50, 160 35"/>
    <ellipse cx="100" cy="55" rx="14" ry="22" transform="rotate(15 100 55)"/>
    <ellipse cx="40" cy="135" rx="14" ry="22" transform="rotate(-40 40 135)"/>
    <ellipse cx="165" cy="105" rx="14" ry="22" transform="rotate(50 165 105)"/>
  </svg>
);
