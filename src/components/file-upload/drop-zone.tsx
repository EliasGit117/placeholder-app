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
        '@container rounded-lg relative border border-dashed text-center transition-colors overflow-hidden',
        'p-4 @sm:p-8',
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
        className
      )}
    >
      <input {...getInputProps()} className="sr-only"/>

      <div className="flex flex-col items-center gap-2 @sm:gap-4">
        <div className={cn(
          'flex items-center justify-center rounded-full bg-muted h-10 w-10 @sm:h-16 @sm:w-16',
          isDragging && 'bg-primary/10'
        )}>
          <IconCloud className={cn('h-5 @sm:h-6 text-muted-foreground', isDragging && 'text-primary')}/>
        </div>

        <div className="w-full space-y-1 @sm:space-y-2 overflow-hidden">
          <h3 className="text-xs @[120px]:text-sm font-semibold @sm:text-lg">
            {m['components.file_upload.drop_zone.title']()}
          </h3>
          <p className="hidden @[120px]:block text-muted-foreground text-xs">
            {m['components.file_upload.drop_zone.description']()}
          </p>
          {maxSize && (
            <p className="hidden @[240px]:block text-muted-foreground text-xs">
              {m['components.file_upload.drop_zone.size_limit']({ size: formatBytes(maxSize) })}
            </p>
          )}
        </div>

        <Button type="button" size="sm" className="mt-2 @[120px]:mt-0 @sm:h-10 @sm:text-sm" onClick={openFileDialog}>
          <IconUpload className="h-4 w-4 shrink-0"/>
          <span className="hidden @[120px]:inline">
            {m['components.file_upload.drop_zone.select_files']()}
          </span>
        </Button>
      </div>
    </div>
  );
}
