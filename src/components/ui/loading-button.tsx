import * as React from 'react';
import { Button } from './button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';


interface IProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  hideText?: boolean;
  hideTextOnMobile?: boolean;
  loadingText?: string;
}

function LoadingButton(props: IProps) {
  const {
    loading,
    hideText,
    children,
    disabled,
    hideTextOnMobile,
    loadingText,
    className,
    ...rest
  } = props;

  return (
    <Button
      {...rest}
      data-loading={loading}
      disabled={loading ? true : disabled}
      className={cn("flex items-center gap-2", className)}
    >
      {loading ? (
        <>
          <Spinner/>
          {!hideText && (
            <span className={cn(hideTextOnMobile && "hidden sm:block")}>
              {loadingText ?? m["common.loading"]()}
            </span>
          )}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export { LoadingButton };
