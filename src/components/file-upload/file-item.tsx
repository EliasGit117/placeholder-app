import type { FC } from 'react';
import { FileUploadStatus, formatBytes, type IFileMetadata } from 'src/hooks/use-file-upload';
import { Button } from 'src/components/ui/button';
import { IconAlertCircle, IconRefresh, IconX } from '@tabler/icons-react';
import { Progress } from 'src/components/ui/progress';
import { Alert, AlertAction, AlertDescription } from 'src/components/ui/alert';
import { FileIcon } from './icon.tsx';
import { m } from '@/paraglide/messages';

interface IProps {
  file: File | IFileMetadata;
  preview?: string;
  status?: FileUploadStatus;
  progress?: number;
  error?: string;
  onRemove?: () => void;
  onRetry?: () => void;
}

export const FileItem: FC<IProps> = ({
  file,
  preview,
  status = FileUploadStatus.Success,
  progress = 0,
  error,
  onRemove,
  onRetry,
}) => {
  const isUploading = status === FileUploadStatus.Uploading;

  return (
    <div className="border-border bg-card rounded-lg border p-2.5">
      <div className="flex items-start gap-2.5">
        {/* Thumbnail or icon */}
        <div className="shrink-0">
          {preview && file.type.startsWith('image/') ? (
            <img
              src={preview}
              alt={file.name}
              className="rounded-sm h-12 w-12 border object-cover"
            />
          ) : (
            <div className="border-border bg-muted text-muted-foreground rounded-sm flex h-12 w-12 items-center justify-center border">
              <FileIcon file={file} className="size-4" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="mt-0.75 flex items-center justify-between">
            <p className="inline-flex flex-col justify-center gap-1 truncate font-medium">
              <span className="text-sm">{file.name}</span>
              <span className="text-muted-foreground text-xs">{formatBytes(file.size)}</span>
            </p>
            {onRemove && !isUploading && (
              <Button
                onClick={onRemove}
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-6 hover:bg-transparent hover:opacity-100"
              >
                <IconX className="size-4" />
              </Button>
            )}
          </div>

          {isUploading && (
            <div className="mt-2">
              <Progress value={progress} className="h-1" />
            </div>
          )}

          {status === FileUploadStatus.Error && (
            <Alert variant="destructive" className="mt-2 min-h-10.5">
              <IconAlertCircle className='mt-0.5'/>
              <AlertDescription className="text-xs mt-1">
                {error ?? m['components.file_upload.item.default_error']()}
              </AlertDescription>
              {onRetry && (
                <AlertAction>
                  <Button size="xs" variant="secondary" onClick={onRetry}>
                    <IconRefresh />
                    <span>{m['common.retry']()}</span>
                  </Button>
                </AlertAction>
              )}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};