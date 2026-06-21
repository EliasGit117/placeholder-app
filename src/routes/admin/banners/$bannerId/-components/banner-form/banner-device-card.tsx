import { type FC, useState } from 'react';
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconDeviceDesktop, IconDeviceMobile, IconDeviceTablet, IconSettings, IconX, type TablerIcon } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import { xhrUpload } from '@/lib/utils/xhr-upload.ts';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { DropZone } from '@/components/file-upload/drop-zone.tsx';
import { Field } from '@/components/ui/field.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import { Skeleton } from '@/components/ui/skeleton.tsx';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { m } from '@/paraglide/messages';
import { BannerStyle, BannerXAlign, BannerYAlign, ImageResourceType } from '~/prisma/generated/prisma/enums.ts';
import { bannerDevicePurpose, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';
import { getImageUploadConstraints } from '@/features/images/consts/image-resource-map.ts';
import type { TUpdateBannerDto } from '@/features/banners/dtos/update-banner.ts';
import { BannerAlignSelect } from './banner-align-select.tsx';
import { BannerStyleSelect } from './banner-style-select.tsx';
import { overlayXClass, overlayYClass } from '@/routes/_public/-components/hero-banner-carousel/utils.ts';


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

const deviceWidth: Record<BannerDevice, string> = {
  mobile:  'w-[140px]',
  tablet:  'w-[210px]',
  desktop: 'w-[320px]',
};

interface IProps {
  bannerId: number;
  device: BannerDevice;
  form: UseFormReturn<TUpdateBannerDto>;
  disabled?: boolean;
}

export const BannerDeviceCard: FC<IProps> = ({ bannerId, device, form, disabled }) => {
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

  const xAlign        = useWatch({ control: form.control, name: alignXKey(device) });
  const yAlign        = useWatch({ control: form.control, name: alignYKey(device) });
  const style         = useWatch({ control: form.control, name: styleKey(device) });
  const titleRo       = useWatch({ control: form.control, name: 'titleRo' });
  const descriptionRo = useWatch({ control: form.control, name: 'descriptionRo' });
  const href          = useWatch({ control: form.control, name: 'href' });
  const lightEl = style === BannerStyle.LIGHT;
  const hasContent = titleRo || descriptionRo || href;

  return (
    <div className={cn('flex flex-col gap-3', deviceWidth[device])}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <DeviceIcon className="size-4 text-muted-foreground"/>
          {deviceLabel[device]()}
        </span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              aria-label="Alignment and style settings"
            >
              <IconSettings className="size-4"/>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-56 flex flex-col gap-3" align="end">
            <Controller
              name={alignXKey(device)}
              control={form.control}
              render={({ field }) => (
                <Field>
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
                <Field>
                  <BannerAlignSelect
                    axis="y"
                    disabled={disabled}
                    value={field.value ?? BannerYAlign.BOTTOM}
                    onChange={field.onChange}
                  />
                </Field>
              )}
            />
            <Controller
              name={styleKey(device)}
              control={form.control}
              render={({ field }) => (
                <Field>
                  <BannerStyleSelect
                    disabled={disabled}
                    value={field.value ?? BannerStyle.LIGHT}
                    onChange={field.onChange}
                  />
                </Field>
              )}
            />
          </PopoverContent>
        </Popover>
      </div>

      {imagesPending ? (
        <Skeleton className={cn(PREVIEW_BOX, deviceWidth[device], 'rounded-md')}/>
      ) : image ? (
        <div className={cn('flex flex-col gap-1', deviceWidth[device])}>
          <div
            className={cn(`group relative flex ${PREVIEW_BOX} items-center justify-center overflow-hidden rounded-md border bg-muted bg-cover bg-center`)}
            style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
          >
            <img src={image.url} alt="" decoding="async" className="h-full w-full object-cover"/>
            {/* Vertical shadows — mirrors withVerticalShadow on the real carousel */}
            <div className="absolute inset-x-0 top-0 h-12 bg-linear-to-b from-black/25 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-black/25 to-transparent pointer-events-none z-10" />

            {hasContent && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
                <div
                  className="absolute top-0 left-0"
                  style={{ width: '400%', height: '400%', transform: 'scale(0.25)', transformOrigin: 'top left' }}
                >
                  <div className={cn(
                    'absolute inset-x-0 flex flex-col px-6 gap-2',
                    overlayYClass(yAlign ?? BannerYAlign.BOTTOM),
                    overlayXClass(xAlign ?? BannerXAlign.LEFT),
                  )}>
                    {titleRo && (
                      <p className={cn('text-4xl leading-[1.05] tracking-tight max-w-3xl whitespace-pre-line', lightEl ? 'text-white' : 'text-gray-800')}>
                        {titleRo}
                      </p>
                    )}
                    {descriptionRo && (
                      <p className={cn('text-base max-w-xl leading-relaxed whitespace-pre-line', lightEl ? 'text-white/85' : 'text-gray-800/80')}>
                        {descriptionRo}
                      </p>
                    )}
                    {href && (
                      <div className={cn('mt-2 w-fit px-4 py-2 text-xs font-medium', lightEl ? 'bg-white text-black' : 'bg-gray-900 text-white')}>
                        {m['pages.home.hero_banners.show_details']()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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
          maxSize={constraints.maxSize}
          multiple={false}
          onFilesSelected={(files) => {
            const file = files[0];
            if (file) void onFileSelected(file);
          }}
          className={cn(
            `flex ${PREVIEW_BOX} flex-col items-center justify-center p-4`,
            deviceWidth[device],
            busy && 'pointer-events-none opacity-60'
          )}
        />
      )}

    </div>
  );
};
