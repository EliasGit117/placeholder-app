import { type FC, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconGripVertical, IconPhoto } from '@tabler/icons-react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
} from '@/components/ui/sortable';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import { bannerDevices, type BannerDevice } from '@/features/banners/consts/banner-devices.ts';
import type { TBannerImageDto } from '@/features/banners/dtos/banner-image.ts';
import type { TBannerRowDto } from '@/features/banners/dtos/banner-row.ts';
import { useBannerReorderSheet } from './provider.tsx';


// Thumbnail aspect per device (height fixed, width follows the ratio).
const deviceThumbClass: Record<BannerDevice, string> = {
  mobile: 'aspect-[9/16] h-14',
  tablet: 'aspect-[4/3] h-14',
  desktop: 'aspect-video h-14',
};

// Largest → smallest, to match the table column order.
const reorderDevices = [...bannerDevices].reverse();

const sameOrder = (a: TBannerRowDto[], b: TBannerRowDto[]) =>
  a.length === b.length && a.every((banner, i) => banner.id === b[i].id);

export const BannerReorderSheet: FC = () => {
  const { isOpen, close } = useBannerReorderSheet();
  const queryClient = useQueryClient();

  // Only fetch while the sheet is open; override the global staleTime so each
  // reopen always refetches the latest order (otherwise cached-fresh data within
  // the global window shows no update). Same convention as the variant-images
  // reorder sheet.
  const { data, isPending } = useQuery(
    orpc.admin.banners.getAll.queryOptions({
      enabled: isOpen,
      staleTime: 0,
    })
  );

  // Working copy edited while dragging; reseed whenever the server data changes.
  // Depend on `data` (a stable ref from react-query) rather than a defaulted
  // array — `data ?? []` would be a fresh ref every render and loop the effect.
  const [items, setItems] = useState<TBannerRowDto[]>([]);

  useEffect(() => {
    if (data)
      setItems(data);
  }, [data]);

  const banners = data ?? [];
  const loading = isOpen && isPending;

  const { mutateAsync: reorder, isPending: isSaving } = useMutation({
    mutationFn: (ids: number[]) => orpc.admin.banners.reorder.call({ ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() }),
  });

  const isDirty = !sameOrder(items, banners);

  const onSave = () => {
    toast.promise(reorder(items.map((banner) => banner.id)), {
      loading: m['pages.banners.sheet.reorder_saving'](),
      success: () => {
        close();
        return m['pages.banners.sheet.reorder_success']();
      },
      error: (err: Error) => err?.message ?? m['pages.banners.sheet.reorder_error'](),
    });
  };

  const onOpenChange = (value: boolean) => {
    if (isSaving || value)
      return;

    close();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-md! gap-0"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{m['pages.banners.sheet.reorder_title']()}</SheetTitle>
          <SheetDescription>{m['pages.banners.sheet.reorder_description']()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          {loading ? (
            <div className="flex flex-col gap-2 px-4 py-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <ReorderRowSkeleton key={i}/>
              ))}
            </div>
          ) : (
            <Sortable
              value={items}
              onValueChange={setItems}
              getItemValue={(banner) => banner.id}
              orientation="vertical"
            >
              <SortableContent className="flex flex-col gap-2 px-4 py-1">
                {items.map((banner) => (
                  <BannerReorderRow key={banner.id} banner={banner}/>
                ))}
              </SortableContent>

              <SortableOverlay>
                {({ value }) => {
                  const banner = items.find((b) => b.id === value);
                  return banner ? <BannerReorderRow banner={banner} overlay/> : null;
                }}
              </SortableOverlay>
            </Sortable>
          )}
        </ScrollArea>

        <SheetFooter className="flex flex-row sm:justify-end gap-2 pt-0">
          <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
            <Button variant="outline" disabled={isSaving}>
              <span>{m['common.close']()}</span>
            </Button>
          </SheetClose>

          <LoadingButton
            className="grow sm:min-w-32 sm:grow-0"
            loading={isSaving}
            disabled={!isDirty}
            onClick={onSave}
          >
            <span>{m['common.save']()}</span>
          </LoadingButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};


function BannerReorderRow({ banner, overlay }: { banner: TBannerRowDto; overlay?: boolean }) {
  const title = getLocale() === 'ru' ? banner.titleRu : banner.titleRo;

  return (
    <SortableItem value={banner.id} asChild>
      <div
        className={cn(
          'flex items-center gap-3 rounded-md border bg-card p-2',
          overlay && 'shadow-lg',
        )}
      >
        <SortableItemHandle asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing"
            aria-label={m['pages.banners.sheet.reorder_handle']()}
          >
            <IconGripVertical className="size-4"/>
          </Button>
        </SortableItemHandle>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className={cn('truncate text-sm', !title && 'text-muted-foreground')}>
            {title || m['pages.banners.index.untitled']()}
          </span>

          <div className="flex items-end gap-2">
            {reorderDevices.map((device) => (
              <DeviceThumb key={device} image={banner.images[device]} device={device}/>
            ))}
          </div>
        </div>
      </div>
    </SortableItem>
  );
}

function ReorderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card p-2">
      <Skeleton className="size-7 shrink-0 rounded-md"/>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-32"/>
        <div className="flex items-end gap-2">
          {reorderDevices.map((device) => (
            <Skeleton key={device} className={cn('shrink-0 rounded', deviceThumbClass[device])}/>
          ))}
        </div>
      </div>
    </div>
  );
}

function DeviceThumb({ image, device }: { image?: TBannerImageDto | null; device: BannerDevice }) {
  const placeholder = thumbhashToDataUrl(image?.thumbhash);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded border bg-muted bg-cover bg-center',
        deviceThumbClass[device],
      )}
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
    >
      {image ? (
        <img src={image.url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover"/>
      ) : (
        <IconPhoto className="size-3.5 text-muted-foreground"/>
      )}
    </div>
  );
}
