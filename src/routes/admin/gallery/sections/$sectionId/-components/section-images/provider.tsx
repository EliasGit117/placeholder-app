import { type ReactNode, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { contextFactory } from '@/lib/utils/context-factory.ts';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { m } from '@/paraglide/messages';
import type { TGallerySectionImageDto } from '@/features/gallery-sections/dtos/gallery-section-image.ts';

interface SectionImagesContextValue {
  sectionId: number;
  canUpdate: boolean;
  canDelete: boolean;

  images: TGallerySectionImageDto[];
  isPending: boolean;

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

const [SectionImagesContext, useSectionImages] =
  contextFactory<SectionImagesContextValue>({
    name: 'SectionImagesContext',
  });

export { useSectionImages };

interface IProps {
  sectionId: number;
  canUpdate: boolean;
  canDelete: boolean;
  children: ReactNode;
}

export function SectionImagesProvider(props: IProps) {
  const { sectionId, canUpdate, canDelete, children } = props;

  const queryClient = useQueryClient();
  const confirm = useConfirm();

  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const selectedSet = useMemo(
    () => new Set(selectedIds),
    [selectedIds]
  );

  const { data: images = [], isPending } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({
      input: { sectionId },
    })
  );

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
    <SectionImagesContext.Provider
      value={{
        sectionId,
        canUpdate,
        canDelete,
        images,
        isPending,
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
    </SectionImagesContext.Provider>
  );
}