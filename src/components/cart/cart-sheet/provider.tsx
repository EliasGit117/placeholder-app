import { type ReactNode, useState } from 'react';
import { contextFactory } from '@/lib/utils/context-factory.ts';

interface ICartSheetContext {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const [CartSheetContext, useCartSheet] = contextFactory<ICartSheetContext>({ name: 'CartSheetContext' });

export { useCartSheet };

export const CartSheetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <CartSheetContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CartSheetContext.Provider>
  );
};
