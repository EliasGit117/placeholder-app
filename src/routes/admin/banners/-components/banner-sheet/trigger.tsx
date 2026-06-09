import { type ComponentProps, type FC } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { m } from '@/paraglide/messages';
import { useBannerSheet } from './provider.tsx';

type IProps = Omit<ComponentProps<typeof Button>, 'onClick'>;

export const BannerSheetTrigger: FC<IProps> = ({ children, ...props }) => {
  const { open } = useBannerSheet();

  return (
    <Button onClick={() => open()} {...props}>
      {children ?? (
        <>
          <IconPlus/>
          <span>{m['pages.banners.index.create']()}</span>
        </>
      )}
    </Button>
  );
};
