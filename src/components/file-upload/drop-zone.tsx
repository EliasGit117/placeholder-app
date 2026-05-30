import { cn } from 'src/lib/utils';
import { Button } from 'src/components/ui/button';
import { IconCloud, IconUpload } from '@tabler/icons-react';
import { formatBytes } from 'src/hooks/use-file-upload';
import { useFileDropzone, type IFileDropzoneOptions } from 'src/hooks/use-file-dropzone';
import { m } from '@/paraglide/messages';

interface IProps extends IFileDropzoneOptions {
  maxSize?: number;
  className?: string;
}

export function DropZone({ maxSize, className, ...dropzoneOptions }: IProps) {
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
        'rounded-lg relative border border-dashed p-8 text-center transition-colors',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        className
      )}
    >
      <input {...getInputProps()} className="sr-only"/>

      <div className="flex flex-col items-center gap-4">
        <div
          className={cn('flex h-16 w-16 items-center justify-center rounded-full bg-muted',
            isDragging && 'bg-primary/10'
          )}
        >
          <IconCloud className={cn('h-6 text-muted-foreground', isDragging && 'text-primary')}/>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{m['components.file_upload.drop_zone.title']()}</h3>
          <p className="text-muted-foreground text-sm">
            {m['components.file_upload.drop_zone.description']()}
          </p>
          {maxSize && (
            <p className="text-muted-foreground text-xs">
              {m['components.file_upload.drop_zone.size_limit']({ size: formatBytes(maxSize) })}
            </p>
          )}
        </div>

        <Button onClick={openFileDialog}>
          <IconUpload className="h-4 w-4"/>
          <span>{m['components.file_upload.drop_zone.select_files']()}</span>
        </Button>
      </div>
    </div>
  );
}