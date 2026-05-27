'use client';

import { type FileMetadata, type FileWithPreview } from '@/hooks/use-file-upload';
import { cn } from '@/lib/utils';
import { FileUploadProvider } from './file-upload/context.tsx';
import { DropZone } from './file-upload/drop-zone.tsx';
import { FileUploadErrors } from './file-upload/errors.tsx';
import { FileList } from './file-upload/file-list.tsx';

interface IProgressUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  className?: string;
  onFilesChange?: (files: FileWithPreview[]) => void;
  simulateUpload?: boolean;
}

const defaultImages: FileMetadata[] = [
  {
    id: 'default-3',
    name: 'image-1.png',
    size: 42048,
    type: 'image/png',
    url: 'https://picsum.photos/1000/800?grayscale&random=10'
  },
  {
    id: 'default-4',
    name: 'image-2.png',
    size: 62807,
    type: 'image/png',
    url: 'https://picsum.photos/1000/800?grayscale&random=11'
  }
];

export function Pattern({
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = '*',
  multiple = true,
  className,
  onFilesChange,
  simulateUpload = true
}: IProgressUploadProps) {
  return (
    <FileUploadProvider
      maxFiles={maxFiles}
      maxSize={maxSize}
      accept={accept}
      multiple={multiple}
      initialFiles={defaultImages}
      onFilesChange={onFilesChange}
    >
      <div className={cn('w-full max-w-2xl', className)}>
        <DropZone maxSize={maxSize} />
        <FileList simulateUpload={simulateUpload} className="mt-6" />
        <FileUploadErrors className="mt-5" />
      </div>
    </FileUploadProvider>
  );

}