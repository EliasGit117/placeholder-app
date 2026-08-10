import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Slot } from '@radix-ui/react-slot';
import { useCheckoutSheet } from './provider.tsx';

interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
}

export const CheckoutSheetTrigger: FC<IProps> = ({ ...props }) => {
  const { children, asChild = false, ...btnProps } = props;
  const { open } = useCheckoutSheet();

  if (children && asChild)
    return (
      <Slot onClick={() => open()}>
        {children}
      </Slot>
    );

  return (
    <Button onClick={() => open()} {...btnProps}>
      {children}
    </Button>
  );
};
