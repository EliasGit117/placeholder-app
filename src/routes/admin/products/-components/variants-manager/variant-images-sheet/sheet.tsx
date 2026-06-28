import { type FC, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { IconArrowLeft, IconArrowsSort, IconUpload, IconX } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TProductVariant } from '@/features/products/schemas/product-variant.ts';
import {
  UploadProductVariantImagesProvider,
  UploadDropZone,
  UploadFileList,
} from '../upload-product-variant-images';
import { ImagesPreview } from './images-preview.tsx';
import {
  ReorderProductVariantImagesProvider,
  ReorderGrid,
  ReorderSaveButton,
} from '../reorder-product-variant-images';

// Only one view is visible at a time.
enum Mode {
  Preview = 'preview',
  Upload = 'upload',
  Reorder = 'reorder',
}

interface IProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: TProductVariant | null;
}

export const VariantImagesSheet: FC<IProps> = ({ open, onOpenChange, variant }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const variantId = variant?.id;

  const queryKey = orpc.admin.products.getVariantImages.queryKey({ input: { variantId: variantId ?? 0 } });

  const { data: images = [], isPending } = useQuery(
    orpc.admin.products.getVariantImages.queryOptions({
      input: { variantId: variantId ?? 0 },
      enabled: open && variantId != null,
      // Override the global staleTime so reopening the sheet always refetches
      // (otherwise cached-fresh data within the global window shows no update).
      staleTime: 0,
    })
  );

  const [mode, setMode] = useState<Mode>(Mode.Preview);
  // The mounted child view (upload or reorder) reports its in-flight state here.
  const [isLoading, setIsLoading] = useState(false);

  // Reopening the sheet always starts back on the preview.
  useEffect(() => {
    if (!open)
      setMode(Mode.Preview);
  }, [open]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
    // The variants table reads images from product.get — refresh it too.
    void queryClient.invalidateQueries({ queryKey: orpc.admin.products.get.key() });
  };

  const { mutate: deleteImages, isPending: isDeleting } = useMutation({
    ...orpc.admin.products.deleteVariantImages.mutationOptions(),
    onSuccess: () => invalidate(),
    onError: (err: Error) => toast.error(m['common.error'](), { description: err.message }),
  });

  // Any in-flight work (upload, delete, reorder save) blocks closing/leaving.
  const isBusy = isLoading || isDeleting;

  const onDelete = async (id: number) => {
    if (variantId == null) return;
    const confirmed = await confirm({
      title: m['pages.products.variants.images.delete_title'](),
      description: m['pages.products.variants.images.delete_description'](),
      confirmText: m['common.delete'](),
      cancelText: m['common.cancel'](),
      confirmButton: { variant: 'destructive' },
    });
    if (!confirmed) return;

    deleteImages({ variantId, ids: [id] });
  };

  const handleOpenChange = (v: boolean) => {
    if (v) return;
    if (isBusy) return;
    onOpenChange(false);
  };

  const showEmpty = variantId != null && mode === Mode.Preview && !isPending && images.length === 0;

  const body =
    variantId == null ? null : mode === Mode.Reorder ? (
      <ReorderProductVariantImagesProvider
        variantId={variantId}
        initialData={images}
        onSuccess={() => setMode(Mode.Preview)}
        onPendingChange={setIsLoading}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              {m['pages.products.variants.images.reorder_hint']()}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isLoading}
                onClick={() => setMode(Mode.Preview)}
              >
                <IconX className="size-4"/>
                <span>{m['common.cancel']()}</span>
              </Button>
              <ReorderSaveButton/>
            </div>
          </div>
          <ReorderGrid/>
        </div>
      </ReorderProductVariantImagesProvider>
    ) : mode === Mode.Upload ? (
      <UploadProductVariantImagesProvider
        variantId={variantId}
        onUploaded={invalidate}
        onPendingChange={setIsLoading}
      >
        <div className="space-y-4">
          <UploadDropZone/>
          <UploadFileList/>
        </div>
      </UploadProductVariantImagesProvider>
    ) : (
      <>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending || isDeleting || images.length <= 1}
            onClick={() => setMode(Mode.Reorder)}
          >
            <IconArrowsSort className="size-4"/>
            <span>{m['pages.products.variants.images.reorder']()}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={isPending || isDeleting}
            onClick={() => setMode(Mode.Upload)}
          >
            <IconUpload className="size-4"/>
            <span>{m['pages.products.variants.images.upload']()}</span>
          </Button>
        </div>

        <ImagesPreview
          images={images}
          isPending={isPending}
          disabled={isDeleting}
          onDelete={onDelete}
        />
      </>
    );

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{m['pages.products.variants.images.title']()}</SheetTitle>
          <SheetDescription>{m['pages.products.variants.images.description']()}</SheetDescription>
        </SheetHeader>

        {showEmpty ? (
          <div className="flex flex-1 flex-col gap-4 px-4 py-2 overflow-hidden">
            {body}
          </div>
        ) : (
          <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
            <div className="space-y-4 px-4 py-1">
              {body}
            </div>
          </ScrollArea>
        )}

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            {mode === Mode.Upload && (
              <Button
                variant="outline"
                className="grow sm:grow-0 sm:min-w-32"
                disabled={isBusy}
                onClick={() => setMode(Mode.Preview)}
              >
                <IconArrowLeft/>
                <span>{m['common.back']()}</span>
              </Button>
            )}
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isBusy}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
