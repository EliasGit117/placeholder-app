import type { ComponentProps, FC } from 'react';
import { cn } from '@/lib/utils';
import { SearchByNameInput } from '@/routes/_public/products/-components/header/search-by-name-input.tsx';

interface IProps extends ComponentProps<'header'> {}

export const ProductsHeader: FC<IProps> = ({ className, ...props }) => {

  return (
    <header className={cn('flex gap-2 items-center p-2 border border-border bg-card', className)} {...props}>
      <SearchByNameInput className='max-w-sm'/>
    </header>
  )
}
