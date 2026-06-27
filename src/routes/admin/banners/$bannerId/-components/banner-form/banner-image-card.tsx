import { type FC, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconPhoto, IconX } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { xhrUpload } from '@/lib/utils/xhr-upload.ts';
import { cn, getImageDimensions, isAspect16by9, thumbhashToDataUrl } from '@/lib/utils';
import { DropZone } from '@/components/file-upload/drop-zone.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { m } from '@/paraglide/messages';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannerImagePurpose } from '@/features/banners/consts/banner-devices.ts';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map.ts';


interface IProps {
  bannerId: number;
  disabled?: boolean;
}

export const BannerImageCard: FC<IProps> = ({ bannerId, disabled }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isUploading, setIsUploading] = useState(false);

  const constraints = getImageUploadConstraints(ImageResourceType.BANNER, bannerImagePurpose);

  const { data: image, isPending: imagePending } = useQuery(
    orpc.admin.banners.getImages.queryOptions({ input: { bannerId } })
  );
  const placeholder = thumbhashToDataUrl(image?.thumbhash);

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getImages.queryKey({ input: { bannerId } }) }),
      queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() })
    ]);
  };

  const onError = (error: unknown) => {
    const message = error instanceof Error ? error.message : m['common.error']();
    toast.error(m['common.error'](), { description: message });
  };

  const upload = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading(m['pages.banners.detail.image_uploading']({ percent: 0 }));
    try {
      const body = new FormData();
      body.append('file', file);
      await xhrUpload(`/api/admin/banners/${bannerId}/images`, body, {
        onProgress: (progress) => {
          const message = progress >= 100 ?
            m['pages.banners.detail.image_processing']() :
            m['pages.banners.detail.image_uploading']({ percent: Math.round(progress) });

          toast.loading(message, { id: toastId });
        }
      });
      await refresh();
      toast.success(m['pages.banners.detail.image_uploaded'](), { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : m['pages.banners.detail.image_upload_error']();
      toast.error(m['pages.banners.detail.image_upload_error'](), { id: toastId, description: message });
    } finally {
      setIsUploading(false);
    }
  };

  const onFileSelected = async (file: File) => {
    // Banner images are stored 16:9; warn before uploading anything that will be
    // cropped, and let the admin confirm or cancel.
    try {
      const { width, height } = await getImageDimensions(file);
      if (!isAspect16by9(width, height)) {
        const confirmed = await confirm({
          title: m['pages.banners.detail.aspect_dialog_title'](),
          description: m['pages.banners.detail.aspect_dialog_description'](),
          confirmText: m['pages.banners.detail.aspect_dialog_confirm'](),
          cancelText: m['pages.banners.detail.aspect_dialog_cancel']()
        });
        if (!confirmed)
          return;
      }
    } catch {
      // If dimensions can't be read, fall through and let the server decide.
    }

    await upload(file);
  };

  const { mutate: removeImage, isPending: isRemoving } = useMutation({
    mutationFn: () => orpc.admin.banners.deleteImage.call({ bannerId }),
    onSuccess: async () => {
      await refresh();
      toast.success(m['pages.banners.detail.image_removed']());
    },
    onError
  });

  const busy = disabled || isUploading || isRemoving;

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-1.5">
        <IconPhoto className="size-4 text-muted-foreground"/>
        <span className="text-sm font-medium">{m['pages.banners.detail.image_label']()}</span>
      </div>

      {imagePending ? (
        <Skeleton className="aspect-video w-full rounded-md max-w-lg"/>
      ) : image ? (
        <div className="flex flex-col gap-1 max-w-lg">
          <div
            className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border border-muted bg-muted bg-cover bg-center"
            style={{ backgroundImage: placeholder ? `url(${placeholder})` : undefined }}
          >
            <img
              src={image.url}
              alt=""
              decoding="async"
              className="h-full w-full object-cover"
            />
            <LoadingButton
              hideText
              type="button"
              size="icon-xs"
              variant="destructive"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 bg-red-500! text-neutral-300! border-neutral-300!"
              aria-label={m['pages.banners.detail.remove']()}
              loading={isRemoving}
              disabled={busy}
              onClick={() => removeImage()}
            >
              <IconX className="size-4"/>
            </LoadingButton>
          </div>
        </div>
      ) : (
        <DropZone
          accept={constraints.accept}
          maxFileSize={constraints.maxSize}
          multiple={false}
          onFilesSelected={(files) => {
            const file = files[0];
            if (file) void onFileSelected(file);
          }}
          className={cn(
            'flex aspect-video flex-col items-center justify-center p-4 max-w-lg',
            busy && 'pointer-events-none opacity-60'
          )}
        />
      )}
    </div>
  );
};
