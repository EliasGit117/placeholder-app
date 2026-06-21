import { type FC, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconX, type TablerIcon } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { xhrUpload } from '@/lib/utils/xhr-upload.ts';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { DropZone } from '@/components/file-upload/drop-zone.tsx';
import { Field } from '@/components/ui/field.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { m } from '@/paraglide/messages';
import { BannerStyle, BannerXAlign, BannerYAlign, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannerDevicePurpose, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map.ts';
import type { TUpdateBannerDto } from '@/features/banners/dtos/update-banner.ts';
import { BannerAlignSelect } from './banner-align-select.tsx';
import { BannerStyleSelect } from './banner-style-select.tsx';


const alignXKey = (device: BannerDevice) => `${device}XAlign` as const;
const alignYKey = (device: BannerDevice) => `${device}YAlign` as const;
const styleKey = (device: BannerDevice) => `${device}Style` as const;

const deviceLabel: Record<BannerDevice, () => string> = {
  mobile: () => m['pages.banners.detail.device_mobile'](),
  tablet: () => m['pages.banners.detail.device_tablet'](),
  desktop: () => m['pages.banners.detail.device_desktop'](),
};

const deviceIcon: Record<BannerDevice, TablerIcon> = {
  mobile: IconDeviceMobile,
  tablet: IconDeviceTablet,
  desktop: IconDeviceDesktop,
};

// All device previews share one fixed height so the three columns stay aligned
// regardless of each image's aspect ratio.
const PREVIEW_BOX = 'h-56 max-h-56 w-full';

interface IProps {
  bannerId: number;
  device: BannerDevice;
  form: UseFormReturn<TUpdateBannerDto>;
  disabled?: boolean;
}

export const BannerDeviceCard: FC<IProps> = ({ bannerId, device, form, disabled }) => {
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
      queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() }),
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
    onError,
  });

  const busy = disabled || isUploading || isRemoving;
  const DeviceIcon = deviceIcon[device];

  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <DeviceIcon className="size-4 text-muted-foreground"/>
        {deviceLabel[device]()}
      </span>

      {imagesPending ? (
        <Skeleton className={`${PREVIEW_BOX} rounded-md`}/>
      ) : image ? (
        <div
          className={`group relative flex ${PREVIEW_BOX} items-center justify-center overflow-hidden rounded-md border bg-muted bg-cover bg-center`}
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
      ) : (
        <DropZone
          mode="compact"
          accept={constraints.accept}
          maxSize={constraints.maxSize}
          multiple={false}
          onFilesSelected={(files) => {
            const file = files[0];
            if (file) void onFileSelected(file);
          }}
          className={cn(
            `flex ${PREVIEW_BOX} flex-col items-center justify-center p-4`,
            busy && 'pointer-events-none opacity-60'
          )}
        />
      )}

      <div className="flex gap-2">
        <Controller
          name={alignXKey(device)}
          control={form.control}
          render={({ field }) => (
            <Field className="flex-1">
              <BannerAlignSelect
                axis="x"
                disabled={disabled}
                value={field.value ?? BannerXAlign.LEFT}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          name={alignYKey(device)}
          control={form.control}
          render={({ field }) => (
            <Field className="flex-1">
              <BannerAlignSelect
                axis="y"
                disabled={disabled}
                value={field.value ?? BannerYAlign.CENTER}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
        <Controller
          name={styleKey(device)}
          control={form.control}
          render={({ field }) => (
            <Field className="flex-1">
              <BannerStyleSelect
                disabled={disabled}
                value={field.value ?? BannerStyle.LIGHT}
                onChange={field.onChange}
              />
            </Field>
          )}
        />
      </div>
    </div>
  );
};
