import { type ReactNode, useEffect } from 'react';
import { xhrUpload } from '@/lib/utils';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import {
  useFileUpload,
  type IFileRejection,
  type IUploadFile,
  type IUploadHelpers,
} from '@/hooks/use-file-upload';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map';
import { ImagePurpose, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import type { TImageDto } from '@/features/images/dtos/image-dto.ts';

// Single source of truth: the picker accepts exactly what the server policy
// allows for product-variant images (see imagePolicy in image-resource-map).
const { accept, maxSize } = getImageUploadConstraints(
  ImageResourceType.PRODUCT_VARIANT,
  ImagePurpose.PRODUCT_VARIANT_IMAGE
);

export interface IUploadProductVariantImagesContextValue {
  files: IUploadFile[];
  rejected: IFileRejection[];
  disabled: boolean;
  accept: string;
  maxSize?: number;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  retry: (id: string) => void;
  clearRejected: () => void;
}

const [UploadProductVariantImagesContext, useUploadProductVariantImages] = contextFactory<IUploadProductVariantImagesContextValue>({
  name: 'UploadProductVariantImagesContext'
});

export { useUploadProductVariantImages };

interface IProps {
  variantId: number;
  onUploaded?: () => void;
  onPendingChange?: (isPending: boolean) => void;
  children: ReactNode;
}

export function UploadProductVariantImagesProvider(props: IProps) {
  const { variantId, onUploaded, onPendingChange, children } = props;

  const uploadFile = async (file: File, { onProgress, signal }: IUploadHelpers) => {
    const body = new FormData();
    body.append('file', file);

    await xhrUpload<TImageDto>(
      `/api/admin/products/variants/${variantId}/images`,
      body,
      { signal, onProgress },
    );

    onUploaded?.();
  };

  const [{ files, rejected, isUploading }, { addFiles, removeFile, retry, clearRejected }] =
    useFileUpload({
      accept,
      maxSize,
      maxFiles: 20,
      multiple: true,
      upload: uploadFile,
    });

  // Surface upload activity so a host (e.g. the sheet) can block closing mid-upload.
  useEffect(() => {
    onPendingChange?.(isUploading);
    return () => onPendingChange?.(false);
  }, [isUploading]);

  const value = {
    files: files,
    rejected: rejected,
    disabled: isUploading,
    accept: accept,
    maxSize: maxSize,
    addFiles: addFiles,
    removeFile: removeFile,
    retry: retry,
    clearRejected: clearRejected,
  } satisfies IUploadProductVariantImagesContextValue;

  return (
    <UploadProductVariantImagesContext.Provider value={value}>
      {children}
    </UploadProductVariantImagesContext.Provider>
  );
}
