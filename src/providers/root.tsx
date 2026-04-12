import { type FC, type PropsWithChildren } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';


interface IProps extends PropsWithChildren {
}


export const RootProvider: FC<IProps> = ({ children }) => {

  return (
    <>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </>
  );
};