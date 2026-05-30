import { useEffect, useRef, useState } from 'react';
import { m } from '@/paraglide/messages';

export interface IFileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export enum FileUploadStatus {
  Uploading = 'uploading',
  Success = 'success',
  Error = 'error',
}

export interface IUploadFile {
  id: string;
  file: File | IFileMetadata;
  preview?: string;
  progress: number;
  status: FileUploadStatus;
  error?: string;
}

export interface IUploadHelpers {
  onProgress: (progress: number) => void;
  signal: AbortSignal;
}

export type UploadFn = (file: File, helpers: IUploadHelpers) => Promise<void>;

export enum RejectionReason {
  TooLarge = 'too-large',
  InvalidType = 'invalid-type',
  TooMany = 'too-many',
}

export interface IFileRejection {
  file: File;
  reason: RejectionReason;
  message: string;
}

export interface IUseFileUploadOptions {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  initialFiles?: IFileMetadata[];
  upload?: UploadFn;
  onReject?: (rejections: IFileRejection[]) => void;
  onFileSuccess?: (file: IUploadFile) => void;
  onFileError?: (file: IUploadFile, error: Error) => void;
}

export interface IUseFileUploadState {
  files: IUploadFile[];
  rejected: IFileRejection[];
  isUploading: boolean;
}

export interface IUseFileUploadActions {
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  retry: (id: string) => void;
  cancel: (id: string) => void;
  clear: () => void;
  clearRejected: () => void;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createPreview(file: File): string | undefined {
  if (file.type.startsWith('image/')) return URL.createObjectURL(file);
  return undefined;
}

function isFileAccepted(file: File, accept: string): boolean {
  if (accept === '*' || accept === '') return true;

  const acceptedTypes = accept.split(',').map((t) => t.trim());
  const extension = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
  const mime = file.type || '';

  return acceptedTypes.some((type) => {
    if (type.startsWith('.')) return extension === type.toLowerCase();
    if (type.endsWith('/*')) return mime.startsWith(`${type.split('/')[0]}/`);
    return mime === type;
  });
}

function validateFile(file: File, maxSize: number, accept: string): IFileRejection | null {
  if (file.size > maxSize) {
    return {
      file,
      reason: RejectionReason.TooLarge,
      message: m['components.file_upload.rejection.too_large']({ size: formatBytes(maxSize) }),
    };
  }
  if (!isFileAccepted(file, accept)) {
    return {
      file,
      reason: RejectionReason.InvalidType,
      message: m['components.file_upload.rejection.invalid_type'](),
    };
  }
  return null;
}

export const useFileUpload = (
  options: IUseFileUploadOptions = {}
): [IUseFileUploadState, IUseFileUploadActions] => {
  const {
    accept = '*',
    maxSize = Number.POSITIVE_INFINITY,
    maxFiles = Number.POSITIVE_INFINITY,
    multiple = false,
    initialFiles = [],
    upload,
    onReject,
    onFileSuccess,
    onFileError,
  } = options;

  const [files, setFiles] = useState<IUploadFile[]>(() =>
    initialFiles.map((file) => ({
      id: file.id,
      file,
      preview: file.url,
      progress: 100,
      status: FileUploadStatus.Success,
    }))
  );
  const [rejected, setRejected] = useState<IFileRejection[]>([]);

  const filesRef = useRef(files);
  filesRef.current = files;

  const callbacksRef = useRef({ upload, onFileSuccess, onFileError });
  callbacksRef.current = { upload, onFileSuccess, onFileError };

  const controllersRef = useRef<Map<string, AbortController>>(new Map());

  useEffect(() => {
    return () => {
      for (const c of controllersRef.current.values()) c.abort();
      controllersRef.current.clear();
      for (const f of filesRef.current) {
        if (f.preview && f.file instanceof File) URL.revokeObjectURL(f.preview);
      }
    };
  }, []);

  const startUpload = (item: IUploadFile) => {
    const { upload: uploadFn, onFileSuccess: onSuccess, onFileError: onFail } = callbacksRef.current;
    if (!uploadFn || !(item.file instanceof File)) return;

    controllersRef.current.get(item.id)?.abort();
    const controller = new AbortController();
    controllersRef.current.set(item.id, controller);

    setFiles((prev) =>
      prev.map((f) =>
        f.id === item.id
          ? { ...f, status: FileUploadStatus.Uploading, progress: 0, error: undefined }
          : f
      )
    );

    uploadFn(item.file, {
      onProgress: (progress) => {
        if (controller.signal.aborted) return;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, progress: Math.max(0, Math.min(100, progress)) } : f
          )
        );
      },
      signal: controller.signal,
    })
      .then(() => {
        if (controller.signal.aborted) return;
        controllersRef.current.delete(item.id);
        const updated: IUploadFile = { ...item, status: FileUploadStatus.Success, progress: 100, error: undefined };
        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, ...updated } : f)));
        onSuccess?.(updated);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        controllersRef.current.delete(item.id);
        const error = err instanceof Error ? err : new Error(String(err));
        const updated: IUploadFile = {
          ...item,
          status: FileUploadStatus.Error,
          error: error.message || m['components.file_upload.errors.upload_failed'](),
        };
        setFiles((prev) => prev.map((f) => (f.id === item.id ? { ...f, ...updated } : f)));
        onFail?.(updated, error);
      });
  };

  const addFiles = (incoming: File[]) => {
    if (!incoming.length) return;

    const current = filesRef.current;
    const rejections: IFileRejection[] = [];
    const countedExisting = current.filter((f) => f.status !== FileUploadStatus.Success).length;
    const remainingSlots = multiple ? Math.max(0, maxFiles - countedExisting) : 1;

    const newItems: IUploadFile[] = [];
    for (const file of incoming) {
      if (multiple && current.some((f) => f.file.name === file.name && f.file.size === file.size)) {
        continue;
      }

      const rejection = validateFile(file, maxSize, accept);
      if (rejection) {
        rejections.push(rejection);
        continue;
      }

      if (newItems.length >= remainingSlots) {
        rejections.push({
          file,
          reason: RejectionReason.TooMany,
          message: m['components.file_upload.rejection.too_many']({ max: maxFiles }),
        });
        continue;
      }

      newItems.push({
        id: generateId(),
        file,
        preview: createPreview(file),
        progress: 0,
        status: FileUploadStatus.Uploading,
      });
    }

    setRejected(rejections);
    if (rejections.length) onReject?.(rejections);

    if (!newItems.length) return;

    if (multiple) {
      setFiles((prev) => [...prev, ...newItems]);
    } else {
      for (const f of current) {
        if (f.preview && f.file instanceof File) URL.revokeObjectURL(f.preview);
      }
      for (const c of controllersRef.current.values()) c.abort();
      controllersRef.current.clear();
      setFiles(newItems);
    }

    for (const item of newItems) startUpload(item);
  };

  const removeFile = (id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);

    const file = filesRef.current.find((f) => f.id === id);
    if (file?.preview && file.file instanceof File) URL.revokeObjectURL(file.preview);

    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const cancel = (id: string) => {
    controllersRef.current.get(id)?.abort();
    controllersRef.current.delete(id);
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: FileUploadStatus.Error, error: m['components.file_upload.errors.cancelled'](), progress: 0 }
          : f
      )
    );
  };

  const retry = (id: string) => {
    const item = filesRef.current.find((f) => f.id === id);
    if (item && item.file instanceof File) startUpload(item);
  };

  const clear = () => {
    for (const c of controllersRef.current.values()) c.abort();
    controllersRef.current.clear();

    for (const f of filesRef.current) {
      if (f.preview && f.file instanceof File) URL.revokeObjectURL(f.preview);
    }

    setFiles([]);
    setRejected([]);
  };

  const clearRejected = () => setRejected([]);

  const isUploading = files.some((f) => f.status === FileUploadStatus.Uploading);

  return [
    { files, rejected, isUploading },
    { addFiles, removeFile, retry, cancel, clear, clearRejected },
  ];
};

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Number.parseFloat((bytes / k ** i).toFixed(dm)) + sizes[i];
};