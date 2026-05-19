import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { useGallerySectionSheet, type TGallerySectionSheetOptions } from './provider';
import { IconPlus } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  options: TGallerySectionSheetOptions;
}

export const GallerySectionSheetTrigger: FC<IProps> = ({ options, children, ...btnProps }) => {
  const { open } = useGallerySectionSheet();

  if (children)
    return (
      <span onClick={() => open(options)} className="contents">
        {children}
      </span>
    );

  return (
    <Button onClick={() => open(options)} {...btnProps}>
      <IconPlus size={16}/>
      <span>{m['common.create']()}</span>
    </Button>
  );
};
