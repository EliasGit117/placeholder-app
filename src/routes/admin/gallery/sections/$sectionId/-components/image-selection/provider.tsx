import { type ReactNode, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { m } from '@/paraglide/messages';

interface ImageSelectionContextValue {
  selecting: boolean;
  selectedIds: number[];
  selectedSet: Set<number>;

  isDeleting: boolean;

  toggle: (id: number) => void;
  start: () => void;
  cancel: () => void;
  clear: () => void;

  confirmDelete: () => Promise<void>;
}

const [ImageSelectionContext, useImageSelection] =
  contextFactory<ImageSelectionContextValue>({
    name: 'ImageSelectionContext',
  });

export { useImageSelection };

interface IProps {
  sectionId: number;
  children: ReactNode;
}

export function ImageSelectionProvider(props: IProps) {
  const { sectionId, children } = props;

  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedSet = new Set(selectedIds);

  const { mutateAsync: deleteImages, isPending: isDeleting } = useMutation({
    ...orpc.admin.gallery.sections.deleteImages.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.admin.gallery.sections.getImages.key(),
      });
    },
  });

  const toggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const start = () => setSelecting(true);

  const cancel = () => {
    setSelecting(false);
    setSelectedIds([]);
  };

  const clear = () => setSelectedIds([]);

  const confirmDelete = async () => {
    if (selectedIds.length === 0) return;

    const isConfirmed = await confirm({
      title: m['pages.gallery_sections.detail.delete.title'](),
      description: m['pages.gallery_sections.detail.delete.description'](),
      confirmText: m['common.delete'](),
      cancelText: m['common.cancel'](),
      confirmButton: { variant: 'destructive' },
    });

    if (!isConfirmed) return;

    await toast.promise(
      deleteImages({ sectionId, ids: selectedIds }),
      {
        loading: m['pages.gallery_sections.detail.delete.deleting'](),
        success: m['pages.gallery_sections.detail.delete.success'](),
        error: (err: Error) =>
          err?.message ?? m['pages.gallery_sections.detail.delete.error'](),
      }
    );

    cancel();
  };

  return (
    <ImageSelectionContext.Provider
      value={{
        selecting,
        selectedIds,
        selectedSet,
        isDeleting,
        toggle,
        start,
        cancel,
        clear,
        confirmDelete,
      }}
    >
      {children}
    </ImageSelectionContext.Provider>
  );
}
