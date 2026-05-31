import { useState } from 'react';
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { rectSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from '@/components/ui/sortable';
import { cn } from '@/lib/utils';
import { useImageReorder } from '../image-reorder';
import { ImageCard } from './image-card';

const GRID_CLASS = 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';

export function SortableImages() {
  const { items, setItems, isSaving } = useImageReorder();
  const [activeId, setActiveId] = useState<number | null>(null);

  // A small pointer distance avoids accidental drags on click; the touch delay
  // means a quick swipe still scrolls the page and only a press-and-hold starts
  // a drag.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
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
            className={cn(
              // The item defaults to `touch-action: none`, which blocks page
              // scrolling on touch devices. Allow vertical panning so a swipe
              // still scrolls while a press-and-hold starts the drag.
              'touch-pan-y!',
              // The dragged item floats in the overlay; leave a plain muted slot
              // behind it (override the component's default faded-image style).
              activeId === img.id && 'opacity-100!',
            )}
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
  );
}
