import { type ReactNode, useState } from 'react';
import { contextFactory } from '@/lib/utils/context-factory.ts';

interface ICheckoutSheetContext {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const [CheckoutSheetContext, useCheckoutSheet] = contextFactory<ICheckoutSheetContext>({ name: 'CheckoutSheetContext' });

export { useCheckoutSheet };

export const CheckoutSheetProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <CheckoutSheetContext.Provider value={{ isOpen, open, close }}>
      {children}
    </CheckoutSheetContext.Provider>
  );
};
