import type { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { envConfig } from 'src/lib/config';
import { cn } from 'src/lib/utils';
import logo from '/images/common/logo_sm.png';


interface IProps {
  className?: string
}

export const LogoButton: FC<IProps> = ({ className }) => {

  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <figure className="size-7 sm:size-8 border border-primary brightness-200 dark:brightness-100 overflow-clip relative">
        <img src={logo} alt="logo" className='absolute inset-0 grayscale invert dark:invert-0'/>
      </figure>

      <span className="text-lg sm:text-xl font-semibold">
        {envConfig.appName}
      </span>
    </Link>
  )
}