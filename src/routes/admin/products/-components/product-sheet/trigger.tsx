import type { ComponentProps, FC } from 'react';
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { useProductSheet } from './provider.tsx';

export const ProductSheetTrigger: FC<ComponentProps<typeof Button>> = ({ onClick, children, ...props }) => {
  const { open } = useProductSheet();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(event) => {
        onClick?.(event);
        open();
      }}
      {...props}
    >
      {children ?? (
        <>
          <IconPlus className="size-4"/>
          <span>{m['pages.products.index.create']()}</span>
        </>
      )}
    </Button>
  );
};
