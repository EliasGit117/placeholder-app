import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader, EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty.tsx';
import { IconHome, IconRefresh, IconSearchOff } from '@tabler/icons-react';
import type { ComponentProps, FC } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button.tsx';
import { Link, type LinkProps } from '@tanstack/react-router';
import { m } from '@/paraglide/messages';


interface IProps extends ComponentProps<typeof Empty> {
  homeLinkOptions?: LinkProps;
}

export const PageNotFound: FC<IProps> = ({ className, homeLinkOptions = { to: '/' }, ...props }) => {

  return (
    <Empty className={cn(className)} {...props}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconSearchOff/>
        </EmptyMedia>
        <EmptyTitle>
          {m['common.page_not_found.title']()}
        </EmptyTitle>
        <EmptyDescription className="whitespace-pre-line">
          {m['common.page_not_found.description']()}
        </EmptyDescription>
      </EmptyHeader>

      <EmptyContent className="flex-row justify-center gap-2">
        <Link {...homeLinkOptions}>
          <Button variant="outline">
            <IconHome/>
            <span>{m['common.page_not_found.home']()}</span>
          </Button>
        </Link>

        <Button variant="outline" onClick={() => window.location.reload()}>
          <IconRefresh/>
          <span>{m['common.refresh']()}</span>
        </Button>
      </EmptyContent>
    </Empty>
  );
};
