import { type ReactNode, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import { m } from '@/paraglide/messages';
import type { TGallerySectionImageDto } from '@/features/gallery-sections/dtos/gallery-section-image.ts';

interface ImageReorderContextValue {
  reordering: boolean;
  items: TGallerySectionImageDto[];
  isSaving: boolean;

  start: () => void;
  cancel: () => void;
  setItems: (next: TGallerySectionImageDto[]) => void;
  save: () => Promise<void>;
}

const [ImageReorderContext, useImageReorder] = contextFactory<ImageReorderContextValue>({ name: 'ImageReorderContext' });

export { useImageReorder };

interface IProps {
  sectionId: number;
  children: ReactNode;
}

export function ImageReorderProvider(props: IProps) {
  const { sectionId, children } = props;

  const queryClient = useQueryClient();

  // Same query the grid subscribes to (React Query dedupes); used to seed the
  // working copy when entering reorder mode.
  const { data: images = [] } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })
  );

  const [reordering, setReordering] = useState(false);
  const [items, setItems] = useState<TGallerySectionImageDto[]>([]);
  // Snapshot of the order at the time reorder mode was entered, used to detect
  // whether anything actually changed before allowing a save.

  const { mutateAsync: reorderImages, isPending: isSaving } = useMutation({
    ...orpc.admin.gallery.sections.reorderImages.mutationOptions(),
    onSuccess: (data) => {
      // Write the server's authoritative order straight into the cache so the
      // static grid renders the new order the moment we leave reorder mode —
      // no invalidate/refetch flash back to the old order.
      queryClient.setQueryData(
        orpc.admin.gallery.sections.getImages.queryKey({ input: { sectionId } }),
        data,
      );
    },
  });

  const start = () => {
    setItems(images);
    setReordering(true);
  };

  const cancel = () => {
    setReordering(false);
    setItems([]);
  };

  const save = async () => {
    const promise = reorderImages({ sectionId, ids: items.map((img) => img.id) });

    toast.promise(promise, {
      loading: m['pages.gallery_sections.detail.reorder.saving'](),
      success: m['pages.gallery_sections.detail.reorder.success'](),
      error: (err: Error) =>
        err?.message ?? m['pages.gallery_sections.detail.reorder.error'](),
    });

    try {
      // Stay in reorder mode (showing the dragged order) until the server
      // confirms; only then drop back to the static grid.
      await promise;
      cancel();
    } catch {
      // Keep reorder mode so the user can retry — the toast already showed why.
    }
  };

  return (
    <ImageReorderContext.Provider value={{ reordering, items, isSaving, start, cancel, setItems, save }}>
      {children}
    </ImageReorderContext.Provider>
  );
}
