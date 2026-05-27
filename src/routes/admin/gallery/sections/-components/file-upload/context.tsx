import { createContext, useContext, type ReactNode } from 'react';
import {
  useFileUpload,
  type FileUploadActions,
  type FileUploadOptions,
  type FileUploadState
} from '@/hooks/use-file-upload';

interface FileUploadContextValue extends FileUploadState, FileUploadActions {}

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

interface FileUploadProviderProps extends FileUploadOptions {
  children: ReactNode;
}

export function FileUploadProvider({ children, ...options }: FileUploadProviderProps) {
  const [state, actions] = useFileUpload(options);

  return (
    <FileUploadContext.Provider value={{ ...state, ...actions }}>
      {children}
    </FileUploadContext.Provider>
  );
}

export function useFileUploadContext() {
  const ctx = useContext(FileUploadContext);
  if (!ctx)
    throw new Error('useFileUploadContext must be used within FileUploadProvider');

  return ctx;
}