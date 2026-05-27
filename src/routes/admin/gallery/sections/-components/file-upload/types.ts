import type { FileWithPreview } from '@/hooks/use-file-upload.ts';

export enum FileUploadStatus {
  Uploading = 'uploading',
  Completed = 'completed',
  Error = 'error'
}

export interface IFileUploadItem extends FileWithPreview {
  progress: number;
  status: FileUploadStatus;
  error?: string;
}