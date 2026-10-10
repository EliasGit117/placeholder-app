import { createContext, useContext, useState, type ReactNode } from 'react';
import type { TBrandDto } from '@/features/brands/common/dtos/brand.ts';

export enum BrandSheetMode {
  Create = 'create',
  Update = 'update',
}

interface IBrandSheetCreateOptions {
  mode: BrandSheetMode.Create;
}

interface IBrandSheetUpdateOptions {
  mode: BrandSheetMode.Update;
  brand: TBrandDto;
}

export type TBrandSheetOptions = IBrandSheetCreateOptions | IBrandSheetUpdateOptions;

interface IBrandSheetContextValue {
  isOpen: boolean;
  options?: TBrandSheetOptions;
  open: (options: TBrandSheetOptions) => void;
  close: () => void;
}

const BrandSheetContext = createContext<IBrandSheetContextValue | null>(null);

export const BrandSheetProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<TBrandSheetOptions>();

  return (
    <BrandSheetContext.Provider
      value={{
        isOpen: options != null,
        options,
        open: setOptions,
        close: () => setOptions(undefined),
      }}
    >
      {children}
    </BrandSheetContext.Provider>
  );
};

export const useBrandSheet = (): IBrandSheetContextValue => {
  const ctx = useContext(BrandSheetContext);
  if (!ctx)
    throw new Error('useBrandSheet must be used within a BrandSheetProvider');

  return ctx;
};
