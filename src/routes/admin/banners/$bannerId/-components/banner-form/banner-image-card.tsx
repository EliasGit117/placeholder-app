import { type FC, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconPhoto, IconX } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { xhrUpload } from '@/lib/utils/xhr-upload.ts';
import { cn, getImageDimensions, isAspectRatio, thumbhashToDataUrl } from '@/lib/utils';
import { DropZone } from '@/components/file-upload/drop-zone.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { m } from '@/paraglide/messages';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import {
  type BannerDevice,
  bannerAspectByDevice,
  bannerImagePurposeByDevice
} from '@/features/banners/consts/banner-devices.ts';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map.ts';


interface IProps {
  bannerId: number;
  device: BannerDevice;
  disabled?: boolean;
}

// Per-device copy, the box aspect ratio, and the grid span of the card.
const deviceConfig: Record<BannerDevice, {
  label: () => string;
  aspectClass: string;
  maxWidthClass: string;
  dialogTitle: () => string;
  dialogDescription: () => string;
}> = {
  desktop: {
    label: () => m['pages.banners.detail.image_label_desktop'](),
    aspectClass: 'aspect-3/1',
    maxWidthClass: 'max-w-3xl',
    dialogTitle: () => m['pages.banners.detail.aspect_dialog_title'](),
    dialogDescription: () => m['pages.banners.detail.aspect_dialog_description'](),
  },
  mobile: {
    label: () => m['pages.banners.detail.image_label_mobile'](),
    aspectClass: 'aspect-[6/5]',
    maxWidthClass: 'max-w-sm',
    dialogTitle: () => m['pages.banners.detail.aspect_dialog_mobile_title'](),
    dialogDescription: () => m['pages.banners.detail.aspect_dialog_mobile_description'](),
  },
};

export const BannerImageCard: FC<IProps> = ({ bannerId, device, disabled }) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const [isUploading, setIsUploading] = useState(false);

  const config = deviceConfig[device];
  const purpose = bannerImagePurposeByDevice[device];
  const targetAspect = bannerAspectByDevice[device];
  const constraints = getImageUploadConstraints(ImageResourceType.BANNER, purpose);

  const { data: images, isPending: imagePending } = useQuery(
    orpc.admin.banners.getImages.queryOptions({ input: { bannerId } })
  );
  const image = images?.[device] ?? null;
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
      await xhrUpload(`/api/admin/banners/${bannerId}/images?device=${device}`, body, {
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
    // Banner images are stored at this device's ratio; warn before uploading
    // anything that will be cropped, and let the admin confirm or cancel.
    try {
      const { width, height } = await getImageDimensions(file);
      if (!isAspectRatio(width, height, targetAspect)) {
        const confirmed = await confirm({
          title: config.dialogTitle(),
          description: config.dialogDescription(),
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
    mutationFn: () => orpc.admin.banners.deleteImage.call({ bannerId, device }),
    onSuccess: async () => {
      await refresh();
      toast.success(m['pages.banners.detail.image_removed']());
    },
    onError
  });

  const busy = disabled || isUploading || isRemoving;

  return (
    <div className={cn('flex w-full flex-col gap-3 min-w-0', config.maxWidthClass)}>
      <div className="flex items-center gap-1.5">
        <IconPhoto className="size-4 text-muted-foreground"/>
        <span className="text-sm font-medium">{config.label()}</span>
      </div>

      {imagePending ? (
        <Skeleton className={cn(config.aspectClass, 'w-full rounded-md')}/>
      ) : image ? (
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              'group relative flex w-full items-center justify-center overflow-hidden rounded-md border border-muted bg-muted bg-cover bg-center',
              config.aspectClass
            )}
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
        <div className={cn('relative w-full', config.aspectClass)}>
          <DropZone
            accept={constraints.accept}
            maxFileSize={constraints.maxSize}
            multiple={false}
            onFilesSelected={(files) => {
              const file = files[0];
              if (file) void onFileSelected(file);
            }}
            className={cn(
              'absolute inset-0 flex flex-col items-center justify-center',
              busy && 'pointer-events-none opacity-60'
            )}
            hideIcon
          />
        </div>
      )}
    </div>
  );
};
