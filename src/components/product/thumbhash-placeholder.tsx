import type { FC } from 'react';
import { cn, thumbhashToDataUrl } from '@/lib/utils';

interface IThumbhashPlaceholderProps {
  thumbhash: string | null | undefined;
  className?: string;
}

// Blurred blur-up backdrop for an image. Must sit inside a `relative overflow-hidden`
// container, before the <img>, which has to be positioned (`relative`/`absolute`) to paint above it.
export const ThumbhashPlaceholder: FC<IThumbhashPlaceholderProps> = ({ thumbhash, className }) => {
  const dataUrl = thumbhashToDataUrl(thumbhash);
  if (!dataUrl)
    return null;

  return (
    <div
      aria-hidden
      style={{ backgroundImage: `url(${dataUrl})` }}
      className={cn('absolute inset-0 scale-110 bg-cover bg-center blur-2xl', className)}
    />
  );
};
