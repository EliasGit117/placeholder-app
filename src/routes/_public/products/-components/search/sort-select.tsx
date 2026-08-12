import type { ComponentProps, FC } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import {
  IconChevronDown,
  IconSortAscendingLetters,
  IconSortDescendingLetters,
  IconSortAscending,
  IconSortDescending,
  IconSparkles,
} from '@tabler/icons-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { m } from '@/paraglide/messages';
import { SortDirection } from '@/features/shared/schemas/pagination.ts';
import type { TSearchPublicProductsRequestDto } from '@/features/products/public/dtos/search-public-products.ts';

const sortOptions = [
  { value: 'new', label: m['components.shop.sort_newest'], icon: IconSparkles, sort: undefined, dir: undefined },
  { value: 'name-asc', label: m['components.shop.sort_name_asc'], icon: IconSortAscendingLetters, sort: 'name', dir: SortDirection.ASC },
  { value: 'name-desc', label: m['components.shop.sort_name_desc'], icon: IconSortDescendingLetters, sort: 'name', dir: SortDirection.DESC },
  { value: 'price-asc', label: m['components.shop.sort_price_asc'], icon: IconSortAscending, sort: 'price', dir: SortDirection.ASC },
  { value: 'price-desc', label: m['components.shop.sort_price_desc'], icon: IconSortDescending, sort: 'price', dir: SortDirection.DESC },
] as const satisfies {
  value: string;
  label: () => string;
  icon: typeof IconSparkles;
  sort: TSearchPublicProductsRequestDto['sort'];
  dir: SortDirection | undefined;
}[];

interface IProps extends ComponentProps<'div'> {
  showLabel?: boolean;
}

export const SortSelect: FC<IProps> = ({ showLabel = true, className, ...props }) => {
  const navigate = useNavigate({ from: '/products/' });
  const search = useSearch({ from: '/_public/products/', select: (search) => ({ sort: search.sort, dir: search.dir }) });

  const current = sortOptions.find((o) => o.sort === search.sort && o.dir === search.dir) ?? sortOptions[0];

  const onChange = (value: string) => {
    const option = sortOptions.find((o) => o.value === value) ?? sortOptions[0];

    void navigate({
      search: (prev) => ({ ...prev, sort: option.sort, dir: option.dir, page: 1 }),
      replace: true,
    });
  };

  const CurrentIcon = current.icon;

  return (
    <div className={cn('space-y-3', className)} {...props}>
      {showLabel && <Label>{m['components.shop.sort_label']()}</Label>}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="flex items-center gap-2 truncate">
              <CurrentIcon className="size-4 shrink-0 text-muted-foreground"/>
              {current.label()}
            </span>
            <IconChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground"/>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width) min-w-56">
          <DropdownMenuRadioGroup value={current.value} onValueChange={onChange}>
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <option.icon className="size-4 shrink-0 text-muted-foreground"/>
                {option.label()}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
