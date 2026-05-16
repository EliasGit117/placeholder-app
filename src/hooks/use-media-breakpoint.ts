import { useEffect, useState } from 'react';

export const TAILWIND_BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type TTailwindBreakpoint = keyof typeof TAILWIND_BREAKPOINTS

export function useMediaBreakpoint(value: TTailwindBreakpoint) {
  const breakpointValue = TAILWIND_BREAKPOINTS[value];
  const [isBelow, setIsBelow] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpointValue - 1}px)`);
    const onChange = () => setIsBelow(window.innerWidth < breakpointValue);

    mql.addEventListener('change', onChange);
    setIsBelow(window.innerWidth < breakpointValue);

    return () => mql.removeEventListener('change', onChange);
  }, [breakpointValue]);

  return {
    isBelow: isBelow,
    isAbove: !isBelow,
  };
}