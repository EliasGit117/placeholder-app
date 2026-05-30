import type { FC } from 'react';
import { IconAlertCircle, IconX } from '@tabler/icons-react';
import { Alert, AlertAction, AlertDescription, AlertTitle } from 'src/components/ui/alert';
import { Button } from 'src/components/ui/button';
import { cn } from 'src/lib/utils';
import type { IFileRejection } from 'src/hooks/use-file-upload';

interface IProps {
  rejection: IFileRejection;
  onDismiss?: () => void;
  className?: string;
}

export const RejectedFile: FC<IProps> = ({ rejection, onDismiss, className }) => {
  return (
    <Alert variant="destructive" className={cn(className)}>
      <IconAlertCircle />
      <AlertTitle className="truncate">{rejection.file.name}</AlertTitle>
      <AlertDescription>{rejection.message}</AlertDescription>
      {onDismiss && (
        <AlertAction>
          <Button
            size="icon"
            variant="ghost"
            onClick={onDismiss}
            className="text-destructive size-6 hover:bg-transparent"
          >
            <IconX className="size-4" />
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
};
