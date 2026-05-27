import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { IconUpload } from '@tabler/icons-react';
import { formatBytes } from '@/hooks/use-file-upload';
import { useFileUploadContext } from './context.tsx';

interface IProps {
  maxSize?: number;
  className?: string;
}

export function DropZone({ maxSize, className }: IProps) {
  const {
    isDragging,
    openFileDialog,
    getInputProps,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  } = useFileUploadContext();

  return (
    <div
      className={cn(
        'rounded-lg relative border border-dashed p-8 text-center transition-colors',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input {...getInputProps()} className="sr-only" />

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full',
            isDragging ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <IconUpload className={cn('h-6', isDragging ? 'text-primary' : 'text-muted-foreground')} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload your files</h3>
          <p className="text-muted-foreground text-sm">
            Drag and drop files here or click to browse
          </p>
          {maxSize && (
            <p className="text-muted-foreground text-xs">
              Support for multiple file types up to {formatBytes(maxSize)} each
            </p>
          )}
        </div>

        <Button onClick={openFileDialog}>
          <IconUpload className="h-4 w-4" />
          Select files
        </Button>
      </div>
    </div>
  );
}