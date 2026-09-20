import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader, EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty.tsx';
import { IconAlertTriangle, IconHome, IconRefresh, IconSelector } from '@tabler/icons-react';
import type { ComponentProps, FC } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button.tsx';
import { Link, type LinkProps, type ErrorComponentProps } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';
import { envConfig } from '@/lib/config';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx';


interface IProps extends ErrorComponentProps, Omit<ComponentProps<typeof Empty>, 'error'> {
  homeLinkOptions?: LinkProps;
}

export const SomethingWentWrong: FC<IProps> = ({
  className,
  error,
  reset,
  homeLinkOptions = { to: '/' },
  ...props
}) => {

  return (
    <Empty className={cn(className)} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconAlertTriangle/>
        </EmptyMedia>
        <EmptyTitle>
          {m['common.something_went_wrong.title']()}
        </EmptyTitle>
        <EmptyDescription>
          {m['common.something_went_wrong.description']()}
        </EmptyDescription>
      </EmptyHeader>

      {!envConfig.isProduction && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant='secondary'>
              <span>{m['common.something_went_wrong.error_details']()}</span>
              <IconSelector className='-mr-1'/>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 max-h-64 max-w-xs overflow-auto rounded-md bg-muted p-3 text-left">
            <pre className="text-xs whitespace-pre-wrap wrap-anywhere">{error.stack ?? error.message}</pre>
          </CollapsibleContent>
        </Collapsible>
      )}

      <EmptyContent className="flex-row justify-center gap-2">
        <Button variant="outline" onClick={reset}>
          <IconRefresh/>
          <span>{m['common.retry']()}</span>
        </Button>

        <Link {...homeLinkOptions}>
          <Button variant="outline">
            <IconHome/>
            <span>{m['common.home']()}</span>
          </Button>
        </Link>
      </EmptyContent>
    </Empty>
  );
};
