import type { FC } from 'react';
import { FileUploadStatus } from '@/hooks/use-file-upload';
import { FileItem, RejectedFile } from '@/components/file-upload';
import { useUploadProductVariantImages } from './provider.tsx';

export const UploadFileList: FC = () => {
  const { files, rejected, removeFile, retry, clearRejected } = useUploadProductVariantImages();

  return (
    <>
      {rejected.length > 0 && (
        <div className="space-y-2">
          {rejected.map((r, i) => (
            <RejectedFile key={i} rejection={r} onDismiss={clearRejected}/>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-3">
          {files.map((item) => (
            <FileItem
              key={item.id}
              file={item.file}
              preview={item.preview}
              status={item.status}
              progress={item.progress}
              error={item.error}
              onRemove={
                item.status === FileUploadStatus.Uploading ? undefined : () => removeFile(item.id)
              }
              onRetry={item.status === FileUploadStatus.Error ? () => retry(item.id) : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
};
