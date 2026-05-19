import { type ReactNode, useState } from 'react';
import { contextFactory } from '@/lib/utils/context-factory.ts';


export enum GallerySectionSheetMode {
  Create = 'create',
  Update = 'update',
}

interface IGallerySectionSheetCreateOptions {
  mode: GallerySectionSheetMode.Create;
}

interface IGallerySectionSheetUpdateOptions {
  mode: GallerySectionSheetMode.Update;
  sectionId: number;
}

export type TGallerySectionSheetOptions =
  | IGallerySectionSheetCreateOptions
  | IGallerySectionSheetUpdateOptions;

interface GallerySectionSheetContextValue {
  isOpen: boolean;
  options?: TGallerySectionSheetOptions;
  open: (options: TGallerySectionSheetOptions) => void;
  close: () => void;
}

const [GallerySectionSheetContext, useGallerySectionSheet] = contextFactory<GallerySectionSheetContextValue>({
  name: 'GallerySectionSheetContext',
});

export { useGallerySectionSheet };

export const GallerySectionSheetProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<TGallerySectionSheetOptions>();

  return (
    <GallerySectionSheetContext.Provider
      value={{
        isOpen: !!options,
        options,
        open: setOptions,
        close: () => setOptions(undefined),
      }}
    >
      {children}
    </GallerySectionSheetContext.Provider>
  );
};
