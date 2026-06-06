import type { ComponentProps, FC } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import { useReorderProductVariantImages } from './provider.tsx';

type IProps = Omit<ComponentProps<typeof LoadingButton>, 'loading' | 'onClick'>;

// Save control wired to the reorder context. Place anywhere inside the provider.
export const ReorderSaveButton: FC<IProps> = ({ size = 'sm', children, ...rest }) => {
  const { disabled, submit } = useReorderProductVariantImages();

  return (
    <LoadingButton size={size} loading={disabled} onClick={submit} {...rest}>
      {children ?? (
        <>
          <IconDeviceFloppy className="size-4"/>
          <span>{m['common.save']()}</span>
        </>
      )}
    </LoadingButton>
  );
};
