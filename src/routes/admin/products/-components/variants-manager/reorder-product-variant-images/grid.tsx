import type { FC } from 'react';
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from '@/components/ui/sortable';
import { GRID_CLASS, ImageCard } from './image-card.tsx';
import { useReorderProductVariantImages } from './provider.tsx';

export const ReorderGrid: FC = () => {
  const { items, setItems, activeId, setActiveId, disabled } = useReorderProductVariantImages();

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    // While persisting, lock the grid (no drags, dimmed) until success.
    <div className={cn('transition-opacity', disabled && 'pointer-events-none opacity-60')}>
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
              disabled={disabled}
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
  );
};
