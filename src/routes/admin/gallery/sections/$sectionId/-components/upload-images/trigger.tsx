import { type ComponentProps, type FC } from 'react';
import { IconUpload } from '@tabler/icons-react';
import { Button } from 'src/components/ui/button';
import { m } from '@/paraglide/messages';
import { useUploadImagesSheet, type TUploadImagesSheetOptions } from './provider';


interface IProps extends Omit<ComponentProps<typeof Button>, 'onClick'> {
  options: TUploadImagesSheetOptions;
}

export const UploadImagesSheetTrigger: FC<IProps> = ({ options, children, ...btnProps }) => {
  const { open } = useUploadImagesSheet();

  if (children)
    return (
      <span onClick={() => open(options)} className="contents">
        {children}
      </span>
    );

  return (
    <Button onClick={() => open(options)} {...btnProps}>
      <IconUpload size={16} />
      <span>{m['pages.gallery_sections.detail.upload_sheet.trigger']()}</span>
    </Button>
  );
};
