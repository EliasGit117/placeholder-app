import { type ComponentProps, type FC } from 'react';
import { Button } from '@/components/ui/button';
import { useUserSheet, type TUserSheetOptions } from './provider';
import { IconUserPlus } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  options: TUserSheetOptions;
}

export const UserSheetTrigger: FC<IProps> = ({ options, children, ...btnProps }) => {
  const { open } = useUserSheet();

  if (children)
    return (
      <span onClick={() => open(options)} className="contents">
        {children}
      </span>
    );

  return (
    <Button onClick={() => open(options)} {...btnProps}>
      <IconUserPlus size={16}/>
      <span>{m['common.create']()}</span>
    </Button>
  );
};
