import type { ComponentProps, FC } from 'react';
import { cn } from 'src/lib/utils';
import { envConfig } from 'src/lib/config';


interface IProps extends ComponentProps<'footer'> {}

export const Footer: FC<IProps> = ({ className, ...props }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn("p-4", className)} {...props}>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          © {currentYear} {envConfig.appName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};