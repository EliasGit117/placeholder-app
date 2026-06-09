import { createContext, useContext, useState, type ReactNode } from 'react';

interface BannerReorderSheetContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const BannerReorderSheetContext = createContext<BannerReorderSheetContextValue | null>(null);

export const BannerReorderSheetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BannerReorderSheetContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </BannerReorderSheetContext.Provider>
  );
};

export const useBannerReorderSheet = (): BannerReorderSheetContextValue => {
  const ctx = useContext(BannerReorderSheetContext);
  if (!ctx)
    throw new Error('useBannerReorderSheet must be used within a BannerReorderSheetProvider');

  return ctx;
};
