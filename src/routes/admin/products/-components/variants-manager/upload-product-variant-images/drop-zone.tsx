import type { FC } from 'react';
import { DropZone } from '@/components/file-upload';
import { useUploadProductVariantImages } from './provider.tsx';

export const UploadDropZone: FC = () => {
  const { accept, maxSize, addFiles } = useUploadProductVariantImages();

  return <DropZone multiple accept={accept} maxFileSize={maxSize} onFilesSelected={addFiles}/>;
};
