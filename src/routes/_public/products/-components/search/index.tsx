import type { ComponentProps, FC } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { IconFilterOff } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { m } from '@/paraglide/messages';
import { Separator } from '@/components/ui/separator';
import { SearchByNameInput } from '@/routes/_public/products/-components/header/search-by-name-input.tsx';
import { SortSelect } from './sort-select.tsx';
import { PriceRangeFilter } from './price-range-filter.tsx';
import { CategoryFilter } from './category-filter.tsx';

interface IProps extends ComponentProps<typeof Card> {
  showTitle?: boolean;
  showSort?: boolean;
}

export const ProductSearchPanel: FC<IProps> = ({ className, showTitle = true, showSort = true, ...props }) => {
  const navigate = useNavigate({ from: '/products/' });
  const hasActiveFilters = useSearch({
    from: '/_public/products/',
    select: (search) => Boolean(search.name || search.categoryId != null || search.priceMin != null || search.priceMax != null)
  });

  const reset = () => {
    void navigate({
      search: (prev) => ({
        ...prev,
        name: undefined,
        categoryId: undefined,
        priceMin: undefined,
        priceMax: undefined,
        page: 1
      }),
      replace: true
    });
  };

  return (
    <Card className={cn(className)} {...props}>
      <CardContent className="space-y-5">
        {showSort && (
          <>
            <SortSelect/>

            <Separator/>
          </>
        )}

        <div className={cn('flex min-h-7 items-center', showTitle ? 'justify-between' : 'justify-end')}>
          {showTitle && <span className="text-sm font-medium">{m['components.shop.filters.title']()}</span>}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              onClick={reset}
              aria-label={m['components.shop.filters.reset']()}
              title={m['components.shop.filters.reset']()}
            >
              <IconFilterOff/>
            </Button>
          )}
        </div>

        <div className="space-y-3">
          <Label>{m['components.shop.filters.name_label']()}</Label>
          <SearchByNameInput className="w-full"/>
        </div>

        <CategoryFilter/>
        <PriceRangeFilter/>
      </CardContent>
    </Card>
  );
};
