import { type FC, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { IconChevronDown, IconFilter } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { m } from '@/paraglide/messages';
import { FilterDropdownItem } from './filter-dropdown-item.tsx';

export const BrandFilter: FC = () => {
  const navigate = useNavigate({ from: '/products/' });
  const brandId = useSearch({ from: '/_public/products/', select: (search) => search.brandId });

  const { data, isPending } = useQuery(orpc.brands.getAll.queryOptions());
  const brands = data ?? [];

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filtered = query ? brands.filter((brand) => brand.name.toLowerCase().includes(query)) : brands;

  const allLabel = m['components.shop.filters.brand_all']();
  const showAll = !query || allLabel.toLowerCase().includes(query);

  const selected = brandId != null ? brands.find((brand) => brand.id === brandId) : undefined;

  const commit = useDebouncedCallback((id: number | null) => {
    void navigate({
      search: (prev) => ({ ...prev, brandId: id ?? undefined, page: 1 }),
      replace: true,
    });
  }, 400);

  const select = (id: number | null) => {
    commit(id);
    setOpen(false);
    setSearch('');
  };

  if (!isPending && brands.length === 0) return null;

  return (
    <div className="space-y-3">
      <Label>{m['components.shop.filters.brand_label']()}</Label>

      {/* modal: popover is portaled out of the mobile filter Sheet, whose scroll lock would otherwise block touch scroll in the list */}
      <Popover modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isPending}
            className={cn('w-full justify-between font-normal', !selected && 'text-muted-foreground')}
          >
            {isPending ? (
              <Skeleton className="h-4 w-32"/>
            ) : (
              <span className="truncate">{selected ? selected.name : allLabel}</span>
            )}
            <IconChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground"/>
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="p-0 w-(--radix-popover-trigger-width) min-w-56 gap-0"
        >
          <div className="p-1">
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <IconFilter className="size-3.5 text-muted-foreground"/>
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder={`${m['common.select']()}...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </InputGroup>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {showAll && (
              <FilterDropdownItem style={{ paddingLeft: 8 }} selected={brandId == null} onClick={() => select(null)}>
                {allLabel}
              </FilterDropdownItem>
            )}

            {!showAll && filtered.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                {m['common.no_results']()}
              </p>
            ) : (
              filtered.map((brand) => (
                <FilterDropdownItem
                  key={brand.id}
                  selected={brand.id === brandId}
                  onClick={() => select(brand.id)}
                  style={{ paddingLeft: 8 }}
                >
                  {brand.name}
                </FilterDropdownItem>
              ))
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
