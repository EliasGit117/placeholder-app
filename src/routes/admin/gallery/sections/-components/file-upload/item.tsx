import type { FunctionComponent } from 'react';
import { formatBytes } from '@/hooks/use-file-upload.ts';
import { Button } from '@/components/ui/button.tsx';
import { IconAlertCircle, IconRefresh, IconX } from '@tabler/icons-react';
import { Progress } from '@/components/ui/progress.tsx';
import { Alert, AlertAction, AlertDescription } from '@/components/ui/alert.tsx';
import { FileIcon } from '@/routes/admin/gallery/sections/-components/file-upload/icon.tsx';
import { useFileUploadContext } from './context.tsx';
import { FileUploadStatus, type IFileUploadItem } from './types.ts';


interface IProps {
  fileItem: IFileUploadItem;
  onRetry?: () => void;
}

export const FileItem: FunctionComponent<IProps> = ({ fileItem, onRetry }) => {
  const { removeFile } = useFileUploadContext();

  return (
    <div className="border-border bg-card rounded-lg border p-2.5">
      <div className="flex items-start gap-2.5">
        {/* File Icon */}
        <div className="shrink-0">
          {(fileItem.preview && fileItem.file.type.startsWith('image/')) ? (
            <img
              src={fileItem.preview}
              alt={fileItem.file.name}
              className="rounded-lg h-12 w-12 border object-cover"
            />
          ) : (
            <div className="border-border text-muted-foreground rounded-lg flex h-12 w-12 items-center justify-center border">
              <FileIcon file={fileItem.file} className="size-4" />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="min-w-0 flex-1">
          <div className="mt-0.75 flex items-center justify-between">
            <p className="inline-flex flex-col justify-center gap-1 truncate font-medium">
              <span className="text-sm">{fileItem.file.name}</span>
              <span className="text-muted-foreground text-xs">
                {formatBytes(fileItem.file.size)}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => removeFile(fileItem.id)}
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-6 hover:bg-transparent hover:opacity-100"
              >
                <IconX className="size-4" />
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          {fileItem.status === FileUploadStatus.Uploading && (
            <div className="mt-2">
              <Progress value={fileItem.progress} className="h-1" />
            </div>
          )}

          {/* Error Message */}
          {fileItem.status === FileUploadStatus.Error && fileItem.error && (
            <Alert variant="destructive" className="mt-2 min-h-10.5">
              <IconAlertCircle />
              <AlertDescription className="text-xs mt-0.5">
                {fileItem.error}
              </AlertDescription>
              <AlertAction>
                <Button size="xs" variant="secondary" onClick={onRetry}>
                  <IconRefresh />
                  <span>Retry</span>
                </Button>
              </AlertAction>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};