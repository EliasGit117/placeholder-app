import { createContext, useContext, useState, type ReactNode } from 'react';

interface BannerSheetContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const BannerSheetContext = createContext<BannerSheetContextValue | null>(null);

export const BannerSheetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BannerSheetContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </BannerSheetContext.Provider>
  );
};

export const useBannerSheet = (): BannerSheetContextValue => {
  const ctx = useContext(BannerSheetContext);
  if (!ctx)
    throw new Error('useBannerSheet must be used within a BannerSheetProvider');

  return ctx;
};
