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
import { UploadImages } from './upload-images.tsx';
import { ImagesPreview } from './images-preview.tsx';
import { ReorderImages } from './reorder-images.tsx';

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

  const { mutateAsync: deleteImages, isPending: isDeleting } = useMutation({
    ...orpc.admin.products.deleteVariantImages.mutationOptions(),
    onSuccess: () => invalidate(),
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

    try {
      await deleteImages({ variantId, ids: [id] });
    } catch (err) {
      const message = err instanceof Error ? err.message : m['common.error']();
      toast.error(m['common.error'](), { description: message });
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (v) return;
    if (isBusy) return;
    onOpenChange(false);
  };

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

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <div className="space-y-4 px-4 py-1">
            {variantId == null ? null : mode === Mode.Reorder ? (
              <ReorderImages
                variantId={variantId}
                images={images}
                onDone={() => setMode(Mode.Preview)}
                onLoadingChange={setIsLoading}
              />
            ) : mode === Mode.Upload ? (
              <UploadImages
                variantId={variantId}
                onUploaded={invalidate}
                onLoadingChange={setIsLoading}
              />
            ) : (
              <>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" disabled={isDeleting} onClick={() => setMode(Mode.Upload)}>
                    <IconUpload className="size-4"/>
                    <span>{m['pages.products.variants.images.upload']()}</span>
                  </Button>
                  {!isPending && images.length > 1 && (
                    <Button variant="outline" size="sm" disabled={isDeleting} onClick={() => setMode(Mode.Reorder)}>
                      <IconArrowsSort className="size-4"/>
                      <span>{m['pages.products.variants.images.reorder']()}</span>
                    </Button>
                  )}
                </div>

                <ImagesPreview
                  images={images}
                  isPending={isPending}
                  disabled={isDeleting}
                  onDelete={onDelete}
                />
              </>
            )}
          </div>
        </ScrollArea>

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
