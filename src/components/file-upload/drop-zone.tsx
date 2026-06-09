import { cn } from 'src/lib/utils';
import { Button } from 'src/components/ui/button';
import { IconCloud, IconUpload } from '@tabler/icons-react';
import { formatBytes } from 'src/hooks/use-file-upload';
import { useFileDropzone, type IFileDropzoneOptions } from 'src/hooks/use-file-dropzone';
import { m } from '@/paraglide/messages';

interface IProps extends IFileDropzoneOptions {
  maxSize?: number;
  className?: string;
  mode?: 'default' | 'compact';
}

export function DropZone({ maxSize, className, mode = 'default', ...dropzoneOptions }: IProps) {
  const compact = mode === 'compact';

  const [{ isDragging }, {
    getInputProps,
    openFileDialog,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  }] = useFileDropzone(dropzoneOptions);

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'rounded-lg relative border border-dashed text-center transition-colors',
        compact ? 'p-4' : 'p-8',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        className
      )}
    >
      <input {...getInputProps()} className="sr-only"/>

      <div className={cn('flex flex-col items-center gap-4')}>
        <div
          className={cn('flex items-center justify-center rounded-full bg-muted',
            compact ? 'h-12 w-12' : 'h-16 w-16',
            isDragging && 'bg-primary/10'
          )}
        >
          <IconCloud
            className={cn('text-muted-foreground', compact ? 'h-5' : 'h-6', isDragging && 'text-primary')}
          />
        </div>

        <div className="space-y-2">
          <h3 className={cn("text-lg font-semibold", compact && 'text-md')}>
            {m['components.file_upload.drop_zone.title']()}
          </h3>

          {!compact && (
            <p className="text-muted-foreground text-sm">
              {m['components.file_upload.drop_zone.description']()}
            </p>
          )}
          {maxSize && (
            <p className="text-muted-foreground text-xs">
              {m['components.file_upload.drop_zone.size_limit']({ size: formatBytes(maxSize) })}
            </p>
          )}
        </div>

        <Button type='button' size={compact ? 'sm' : 'default'} onClick={openFileDialog}>
          <IconUpload className="h-4 w-4"/>
          <span>{m['components.file_upload.drop_zone.select_files']()}</span>
        </Button>
      </div>
    </div>
  );
}