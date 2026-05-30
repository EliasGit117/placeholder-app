import { type ReactNode, useState } from 'react';
import { contextFactory } from 'src/lib/utils/context-factory.ts';


export interface TUploadImagesSheetOptions {
  sectionId: number;
}

interface UploadImagesSheetContextValue {
  isOpen: boolean;
  options?: TUploadImagesSheetOptions;
  open: (options: TUploadImagesSheetOptions) => void;
  close: () => void;
}

const [UploadImagesSheetContext, useUploadImagesSheet] = contextFactory<UploadImagesSheetContextValue>({
  name: 'UploadImagesSheetContext',
});

export { useUploadImagesSheet };

export const UploadImagesSheetProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<TUploadImagesSheetOptions>();

  return (
    <UploadImagesSheetContext.Provider
      value={{
        isOpen: !!options,
        options,
        open: setOptions,
        close: () => setOptions(undefined),
      }}
    >
      {children}
    </UploadImagesSheetContext.Provider>
  );
};
