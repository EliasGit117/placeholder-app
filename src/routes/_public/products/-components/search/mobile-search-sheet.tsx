import type { FC } from 'react';
import { useSearch } from '@tanstack/react-router';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { m } from '@/paraglide/messages';
import { ProductSearchPanel } from './index.tsx';
import { cn } from '@/lib/utils';

export const MobileSearchSheet: FC = () => {
  const activeCount = useSearch({
    from: '/_public/products/',
    select: (search) => [
      search.name,
      search.categoryId != null,
      search.priceMin != null,
      search.priceMax != null,
    ].filter(Boolean).length,
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={cn("shrink-0 font-normal lg:hidden", activeCount > 0 && "pr-1.5")}>
          <IconAdjustmentsHorizontal className="size-4"/>
          {m['components.shop.filters.title']()}

          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center text-xs border border-border ml-auto">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-full max-w-xs gap-0" showCloseButton={false}>
        <div className="flex-1 overflow-y-auto p-4">
          <ProductSearchPanel className="ring-0 rounded-none bg-transparent p-0" showSort={false}/>
        </div>

        <SheetFooter className="border-t">
          <SheetClose asChild>
            <Button variant="outline">{m['common.close']()}</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
