import { type FC, type ReactNode, useState } from 'react';
import { IconCheck, IconChevronDown, IconFilter } from '@tabler/icons-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import type { TBrandDto } from '@/features/brands/common/dtos/brand.ts';


interface IProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  brands: TBrandDto[];
  loading?: boolean;
  disabled?: boolean;
}

export const BrandSelect: FC<IProps> = ({ value, onValueChange, brands, loading, disabled }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const getName = (brand: TBrandDto) => getLocale() === 'ru' ? brand.nameRu : brand.nameRo;

  const noneLabel = m['pages.products.form.brand_none']();

  const query = search.trim().toLowerCase();
  const filtered = query
    ? brands.filter((brand) => getName(brand).toLowerCase().includes(query))
    : brands;

  const showNone = !query || noneLabel.toLowerCase().includes(query);

  const selected = value != null ? brands.find((brand) => brand.id === value) : undefined;

  const select = (id: number | null) => {
    onValueChange(id);
    setOpen(false);
    setSearch('');
  };

  return (
    // modal: the popover is portaled out of the product Sheet, whose scroll lock would otherwise block scrolling in the list
    <Popover modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled || loading}
          className={cn('w-full justify-between font-normal', !selected && 'text-muted-foreground')}
        >
          {loading ? (
            <Skeleton className="h-4 w-32"/>
          ) : (
            <span className="truncate">{selected ? getName(selected) : noneLabel}</span>
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
          {showNone && (
            <DropdownItem selected={value == null} onClick={() => select(null)}>
              {noneLabel}
            </DropdownItem>
          )}

          {!showNone && filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {m['common.no_results']()}
            </p>
          ) : (
            filtered.map((brand) => (
              <DropdownItem
                key={brand.id}
                selected={brand.id === value}
                onClick={() => select(brand.id)}
              >
                {getName(brand)}
              </DropdownItem>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface IDropdownItemProps {
  selected?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const DropdownItem: FC<IDropdownItemProps> = ({ selected, onClick, children }) => (
  <button
    type="button"
    role="option"
    aria-selected={selected}
    onClick={onClick}
    className={cn(
      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-left cursor-default',
      'hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:bg-accent',
      selected && 'bg-accent/50',
    )}
  >
    <span className="truncate">{children}</span>
    {selected && <IconCheck className="size-3.5 shrink-0 ml-auto"/>}
  </button>
);
