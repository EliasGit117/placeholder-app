import { type FC, type PropsWithChildren } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip.tsx';
import { FavoritesProvider } from './favorites.tsx';


interface IProps extends PropsWithChildren {
}


export const RootProvider: FC<IProps> = ({ children }) => {

  return (
      <TooltipProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </TooltipProvider>
  );
};