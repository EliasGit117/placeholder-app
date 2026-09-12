import type { SVGProps } from 'react';

const petalAngles = [0, 45, 90, 135, 180, 225, 270, 315];

export const IconBotanicalBloom = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth={1.2} {...props}>
    <circle cx="100" cy="100" r="14"/>
    {petalAngles.map((angle) => (
      <path
        key={angle}
        transform={`rotate(${angle} 100 100)`}
        d="M100 86 C 82 74, 80 46, 100 24 C 120 46, 118 74, 100 86 z"
      />
    ))}
  </svg>
);
