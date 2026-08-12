import { type FC, useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useDebouncedCallback } from 'use-debounce';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { m } from '@/paraglide/messages';

const MIN = 0;
const MAX = 50000;
const DEBOUNCE_MS = 400;

export const PriceRangeFilter: FC = () => {
  const navigate = useNavigate({ from: '/products/' });
  const search = useSearch({
    from: '/_public/products/',
    select: (search) => ({ priceMin: search.priceMin, priceMax: search.priceMax }),
  });

  const [value, setValue] = useState<[number, number]>([
    search.priceMin ?? MIN,
    search.priceMax ?? MAX,
  ]);

  useEffect(() => {
    setValue([search.priceMin ?? MIN, search.priceMax ?? MAX]);
  }, [search.priceMin, search.priceMax]);

  const commit = useDebouncedCallback((next: [number, number]) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        priceMin: next[0] <= MIN ? undefined : next[0],
        priceMax: next[1] >= MAX ? undefined : next[1],
        page: 1,
      }),
      replace: true,
    });
  }, DEBOUNCE_MS);

  const update = (next: [number, number]) => {
    setValue(next);
    commit(next);
  };

  const onMinInput = (raw: string) => {
    const parsed = Math.min(Math.max(Number(raw) || MIN, MIN), value[1]);
    update([parsed, value[1]]);
  };

  const onMaxInput = (raw: string) => {
    const parsed = Math.max(Math.min(Number(raw) || MAX, MAX), value[0]);
    update([value[0], parsed]);
  };

  return (
    <div className="space-y-3">
      <Label>{m['components.shop.filters.price_label']()}</Label>

      <Slider
        min={MIN}
        max={MAX}
        step={1}
        value={value}
        onValueChange={(next) => setValue(next as [number, number])}
        onValueCommit={(next) => update(next as [number, number])}
      />

      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={MIN}
          max={value[1]}
          value={value[0]}
          onChange={(e) => onMinInput(e.target.value)}
          className="h-8"
          aria-label={m['components.shop.filters.price_label']()}
        />

        <span className="text-muted-foreground">–</span>

        <Input
          type="number"
          min={value[0]}
          max={MAX}
          value={value[1]}
          onChange={(e) => onMaxInput(e.target.value)}
          className="h-8"
          aria-label={m['components.shop.filters.price_label']()}
        />
      </div>
    </div>
  );
};
