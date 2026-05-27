import { IconAlertCircle } from '@tabler/icons-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import { useFileUploadContext } from './context.tsx';

interface IProps {
  className?: string;
}

export function FileUploadErrors({ className }: IProps) {
  const { errors } = useFileUploadContext();

  if (!errors.length) return null;

  return (
    <Alert variant="destructive" className={className}>
      <IconAlertCircle />
      <AlertTitle>File upload error(s)</AlertTitle>
      <AlertDescription>
        {errors.map((error, index) => (
          <p key={index} className="last:mb-0">
            {error}
          </p>
        ))}
      </AlertDescription>
    </Alert>
  );
}