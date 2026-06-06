import { type FC, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { cn } from '@/lib/utils';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from '@/components/ui/sortable';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconDeviceFloppy, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TProductVariantImageDto } from '@/features/products/dtos/product-variant-image.ts';
import { GRID_CLASS, ImageCard } from './image-card.tsx';

interface IProps {
  variantId: number;
  images: TProductVariantImageDto[];
  onDone: () => void;
  onLoadingChange: (loading: boolean) => void;
}

export const ReorderImages: FC<IProps> = ({ variantId, images, onDone, onLoadingChange }) => {
  const queryClient = useQueryClient();
  const queryKey = orpc.admin.products.getVariantImages.queryKey({ input: { variantId } });

  const [items, setItems] = useState<TProductVariantImageDto[]>(images);
  const [activeId, setActiveId] = useState<number | null>(null);

  const { mutateAsync: reorder, isPending: isSaving } = useMutation({
    ...orpc.admin.products.reorderVariantImages.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      // The variants table reads images from product.get — refresh its order too.
      void queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });
    },
  });

  // Surface save activity so the sheet can block closing mid-save.
  useEffect(() => {
    onLoadingChange(isSaving);
    return () => onLoadingChange(false);
  }, [isSaving]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const save = async () => {
    const ids = items.map((i) => i.id);
    const current = images.map((i) => i.id);
    // Nothing moved — just leave reorder mode without a round-trip.
    if (ids.length === current.length && ids.every((id, i) => id === current[i])) {
      onDone();
      return;
    }

    try {
      await reorder({ variantId, ids });
      onDone();
    } catch (err) {
      // Stay in reorder mode so the user can retry.
      const message = err instanceof Error ? err.message : m['pages.products.variants.images.reorder_error']();
      toast.error(m['pages.products.variants.images.reorder_error'](), { description: message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {m['pages.products.variants.images.reorder_hint']()}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={isSaving} onClick={onDone}>
            <IconX className="size-4"/>
            <span>{m['common.cancel']()}</span>
          </Button>
          <LoadingButton size="sm" loading={isSaving} onClick={save}>
            <IconDeviceFloppy className="size-4"/>
            <span>{m['common.save']()}</span>
          </LoadingButton>
        </div>
      </div>

      {/* While persisting, lock the grid (no drags, dimmed) until success. */}
      <div className={cn('transition-opacity', isSaving && 'pointer-events-none opacity-60')}>
        <Sortable
          value={items}
          onValueChange={setItems}
          getItemValue={(img) => img.id}
          sensors={sensors}
          orientation="mixed"
          strategy={rectSortingStrategy}
          onDragStart={(e) => setActiveId(Number(e.active.id))}
          onDragEnd={() => setActiveId(null)}
          onDragCancel={() => setActiveId(null)}
        >
          <SortableContent className={GRID_CLASS}>
            {items.map((img) => (
              <SortableItem
                key={img.id}
                value={img.id}
                asHandle
                disabled={isSaving}
                className={cn('touch-pan-y!', activeId === img.id && 'opacity-100!')}
              >
                {activeId === img.id ? (
                  <div className="aspect-square rounded-lg border bg-muted"/>
                ) : (
                  <ImageCard image={img}/>
                )}
              </SortableItem>
            ))}
          </SortableContent>
          <SortableOverlay>
            {({ value }) => {
              const img = items.find((i) => i.id === value);
              return img ? <ImageCard image={img}/> : null;
            }}
          </SortableOverlay>
        </Sortable>
      </div>
    </div>
  );
};
