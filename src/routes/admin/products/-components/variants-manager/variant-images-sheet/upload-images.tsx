import { type FC, useEffect } from 'react';
import { xhrUpload } from '@/lib/utils';
import { FileUploadStatus, useFileUpload, type IUploadHelpers } from '@/hooks/use-file-upload';
import { DropZone, FileItem, RejectedFile } from '@/components/file-upload';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import type { TImageDto } from '@/features/images/dtos/image-dto.ts';

// Single source of truth: the picker accepts exactly what the server policy
// allows for product-variant images (see imagePolicy in image-resource-map).
const { accept, maxSize } = getImageUploadConstraints(
  ImageResourceType.PRODUCT_VARIANT,
  ImagePurpose.PRODUCT_VARIANT_IMAGE
);

interface IProps {
  variantId: number;
  onUploaded: () => void;
  onLoadingChange: (loading: boolean) => void;
}

export const UploadImages: FC<IProps> = ({ variantId, onUploaded, onLoadingChange }) => {
  const uploadFile = async (file: File, { onProgress, signal }: IUploadHelpers) => {
    const body = new FormData();
    body.append('file', file);

    await xhrUpload<TImageDto>(
      `/api/admin/products/variants/${variantId}/images`,
      body,
      { signal, onProgress },
    );

    onUploaded();
  };

  const [{ files, rejected, isUploading }, { addFiles, removeFile, retry, clearRejected }] =
    useFileUpload({
      accept,
      maxSize,
      maxFiles: 20,
      multiple: true,
      upload: uploadFile,
    });

  // Surface upload activity so the sheet can block closing mid-upload.
  useEffect(() => {
    onLoadingChange(isUploading);
    return () => onLoadingChange(false);
  }, [isUploading]);

  return (
    <div className="space-y-4">
      <DropZone multiple accept={accept} maxSize={maxSize} onFilesSelected={addFiles}/>

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
    </div>
  );
};
