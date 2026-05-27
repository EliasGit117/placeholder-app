import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconClearAll } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { useFileUploadContext } from './context.tsx';
import { FileItem } from './item.tsx';
import { FileUploadStatus, type IFileUploadItem } from './types.ts';

interface IProps {
  simulateUpload?: boolean;
  className?: string;
}

export function FileList({ simulateUpload = false, className }: IProps) {
  const { files, clearFiles } = useFileUploadContext();

  const [uploadFiles, setUploadFiles] = useState<IFileUploadItem[]>([]);

  useEffect(() => {
    setUploadFiles((prev) =>
      files.map((file) => {
        const existing = prev.find((f) => f.id === file.id);
        if (existing) return { ...existing, ...file };
        return { ...file, progress: 0, status: FileUploadStatus.Uploading };
      })
    );
  }, [files]);

  useEffect(() => {
    if (!simulateUpload) return;

    const interval = setInterval(() => {
      setUploadFiles((prev) =>
        prev.map((file) => {
          if (file.status !== FileUploadStatus.Uploading) return file;

          const increment = Math.random() * 15 + 5;
          const newProgress = Math.min(file.progress + increment, 100);

          if (newProgress > 50 && Math.random() < 0.1) {
            return { ...file, status: FileUploadStatus.Error, error: 'Upload failed. Please try again.' };
          }

          if (newProgress >= 100) {
            return { ...file, progress: 100, status: FileUploadStatus.Completed };
          }

          return { ...file, progress: newProgress };
        })
      );
    }, 500);

    return () => clearInterval(interval);
  }, [simulateUpload]);

  const retryUpload = (id: string) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, progress: 0, status: FileUploadStatus.Uploading, error: undefined } : f
      )
    );
  };

  if (!uploadFiles.length) return null;

  const completedCount = uploadFiles.filter((f) => f.status === FileUploadStatus.Completed).length;
  const errorCount = uploadFiles.filter((f) => f.status === FileUploadStatus.Error).length;
  const uploadingCount = uploadFiles.filter((f) => f.status === FileUploadStatus.Uploading).length;

  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {completedCount > 0 && <Badge>Completed: {completedCount}</Badge>}
          {errorCount > 0 && <Badge variant="destructive">Failed: {errorCount}</Badge>}
          {uploadingCount > 0 && <Badge variant="secondary">Uploading: {uploadingCount}</Badge>}
        </div>
        <Button onClick={clearFiles} variant="outline" size="sm">
          <IconClearAll />
          <span>Clear all</span>
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        {uploadFiles.map((fileItem) => (
          <FileItem
            key={fileItem.id}
            fileItem={fileItem}
            onRetry={() => retryUpload(fileItem.id)}
          />
        ))}
      </div>
    </div>
  );
}