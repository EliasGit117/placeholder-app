import { type FC, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconDeviceDesktop, IconDeviceMobile, IconX, type TablerIcon } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { xhrUpload } from '@/lib/utils/xhr-upload.ts';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { DropZone } from '@/components/file-upload/drop-zone.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { m } from '@/paraglide/messages';
import { ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannerDevicePurpose, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map.ts';


const deviceLabel: Record<BannerDevice, () => string> = {
  compact: () => m['pages.banners.detail.device_compact'](),
  wide: () => m['pages.banners.detail.device_wide']()
};

const deviceIcon: Record<BannerDevice, TablerIcon> = {
  compact: IconDeviceMobile,
  wide: IconDeviceDesktop
};


interface IProps {
  bannerId: number;
  device: BannerDevice;
  disabled?: boolean;
}

export const BannerDeviceCard: FC<IProps> = ({ bannerId, device, disabled }) => {
  'use no memo';
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const constraints = getImageUploadConstraints(ImageResourceType.BANNER, bannerDevicePurpose[device]);

  const { data: images, isPending: imagesPending } = useQuery(
    orpc.admin.banners.getImages.queryOptions({ input: { bannerId } })
  );
  const image = images?.[device];
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

  const onFileSelected = async (file: File) => {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('device', device);
      await xhrUpload(`/api/admin/banners/${bannerId}/images`, body);
      await refresh();
      toast.success(m['pages.banners.detail.image_uploaded']());
    } catch (error) {
      onError(error);
    } finally {
      setIsUploading(false);
    }
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
  const DeviceIcon = deviceIcon[device];

  return (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex items-center gap-1.5">
        <DeviceIcon className="size-4 text-muted-foreground"/>
        <span className="text-sm font-medium">{deviceLabel[device]()}</span>
      </div>

      {imagesPending ? (
        <Skeleton className="h-56 max-h-56 w-full rounded-md"/>
      ) : image ? (
        <div className="flex flex-col gap-1">
          <div
            className="group relative flex h-56 max-h-56 w-full items-center justify-center overflow-hidden rounded-md border bg-muted bg-cover bg-center"
            style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
          >
            <img src={image.url} alt="" decoding="async" className="h-full w-full object-cover"/>
            <LoadingButton
              hideText
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
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
            'flex h-56 max-h-56 flex-col items-center justify-center p-4',
            busy && 'pointer-events-none opacity-60',
          )}
        />
      )}
    </div>
  );
};
