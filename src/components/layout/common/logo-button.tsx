import type { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { cn } from 'src/lib/utils';
import Logo from '@/assets/icons/logo/icon.svg?react';
import LogoText from '@/assets/icons/logo/text.svg?react';


interface IProps {
  className?: string;
}

export const LogoButton: FC<IProps> = ({ className }) => {


  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      <figure className='border border-primary aspect-square flex justify-center items-center size-9'>
        <Logo className="h-7 text-foreground"/>
      </figure>
      <LogoText className="h-8 text-foreground"/>
    </Link>
  );
};