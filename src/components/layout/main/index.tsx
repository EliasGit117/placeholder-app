import { Header } from './header';
import type { FC, PropsWithChildren } from 'react';
import { Footer } from '@/components/layout/main/footer.tsx';

interface IProps extends PropsWithChildren {
}

export const MainLayout: FC<IProps> = ({ children }) => {

  return (
    <>
      <Header/>
      {children}
      <Footer className='mt-auto'/>
    </>
  );
};