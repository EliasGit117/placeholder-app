import { type Dispatch, type ReactNode, type SetStateAction, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import { m } from '@/paraglide/messages';
import type { TProductVariantImageDto } from '@/features/products/common/dtos/product-variant-image.ts';

export interface IReorderProductVariantImagesContextValue {
  items: TProductVariantImageDto[];
  setItems: Dispatch<SetStateAction<TProductVariantImageDto[]>>;
  activeId: number | null;
  setActiveId: Dispatch<SetStateAction<number | null>>;
  disabled: boolean;
  submit: () => void;
}

const [ReorderProductVariantImagesContext, useReorderProductVariantImages] = contextFactory<IReorderProductVariantImagesContextValue>({
  name: 'ReorderProductVariantImagesContext'
});

export { useReorderProductVariantImages };

interface IProps {
  variantId: number;
  initialData?: TProductVariantImageDto[];
  onSuccess?: () => void;
  onPendingChange?: (isPending: boolean) => void;
  children: ReactNode;
}

export function ReorderProductVariantImagesProvider(props: IProps) {
  const { variantId, initialData, onSuccess, onPendingChange, children } = props;

  const queryClient = useQueryClient();
  const queryKey = orpc.admin.products.getVariantImages.queryKey({ input: { variantId } });

  const { data: images = [] } = useQuery(orpc.admin.products.getVariantImages.queryOptions({
    input: { variantId },
    initialData,
    // With initialData present, treat it as fresh briefly so we don't refetch
    // immediately when the parent already handed us the images.
    staleTime: initialData ? 5_000 : 0
  }));

  // Working copy edited while dragging; reseed from the query when not dragging.
  const [items, setItems] = useState<TProductVariantImageDto[]>(initialData ?? []);
  const [activeId, setActiveId] = useState<number | null>(null);

  // Reseed only when the server data actually changes (initial load, refetch,
  // post-save). activeId is read but intentionally NOT a dep — otherwise ending
  // a drag (activeId -> null) would refire and clobber the reordered items.
  useEffect(() => {
    if (activeId != null)
      return;

    setItems(images);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const { mutate: reorder, isPending: isSaving } = useMutation({
    ...orpc.admin.products.reorderVariantImages.mutationOptions(),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
      // The variants table reads images from product.get — refresh its order too.
      void queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });
      onSuccess?.();
    },
    // Stay in reorder mode (onSuccess not called) so the user can retry.
    onError: (err: Error) =>
      toast.error(m['pages.products.variants.images.reorder_error'](), { description: err.message }),
  });

  // Surface save activity so a host (e.g. the sheet) can block closing mid-save.
  useEffect(() => {
    onPendingChange?.(isSaving);
    return () => onPendingChange?.(false);
  }, [isSaving]);

  const submit = () => {
    const ids = items.map((i) => i.id);
    const current = images.map((i) => i.id);
    // Nothing moved — just leave reorder mode without a round-trip.
    if (ids.length === current.length && ids.every((id, i) => id === current[i])) {
      onSuccess?.();
      return;
    }

    reorder({ variantId, ids });
  };

  const value = {
    items: items,
    setItems: setItems,
    activeId: activeId,
    setActiveId: setActiveId,
    disabled: isSaving,
    submit: submit,
  } satisfies IReorderProductVariantImagesContextValue;

  return (
    <ReorderProductVariantImagesContext.Provider value={value}>
      {children}
    </ReorderProductVariantImagesContext.Provider>
  );
}
