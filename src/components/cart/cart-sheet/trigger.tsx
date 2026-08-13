import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { Slot } from '@radix-ui/react-slot';
import { useCartSheet } from './provider.tsx';

interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
}

export const CartSheetTrigger: FC<IProps> = ({ ...props }) => {
  const { children, asChild = false, ...btnProps } = props;
  const { open } = useCartSheet();

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
