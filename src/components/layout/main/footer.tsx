import type { ComponentProps, FC } from 'react';
import { cn } from '@/lib/utils';

interface IProps extends ComponentProps<'footer'> {

}

export const Footer: FC<IProps> = ({ className, ...props }) => {

  return (
    <footer className={cn("container mx-auto p-4", className)} {...props}>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Built with <a href="https://tanstack.com/query/v4" className="underline">TanStack Query</a> and <a
          href="https://tanstack.com/react-router/v7" className="underline">TanStack Router</a>
        </p>
      </div>
    </footer>
  );
};