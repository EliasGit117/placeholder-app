import { createContext, useContext, useState, type ReactNode } from 'react';

interface ProductSheetContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ProductSheetContext = createContext<ProductSheetContextValue | null>(null);

export const ProductSheetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ProductSheetContext.Provider
      value={{
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false)
      }}
    >
      {children}
    </ProductSheetContext.Provider>
  );
};

export const useProductSheet = (): ProductSheetContextValue => {
  const ctx = useContext(ProductSheetContext);
  if (!ctx)
    throw new Error('useProductSheet must be used within a ProductSheetProvider');

  return ctx;
};
