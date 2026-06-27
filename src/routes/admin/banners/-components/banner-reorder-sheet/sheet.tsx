import { type FC, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconPhoto } from '@tabler/icons-react';
import { orpc } from '@/lib/orpc';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay
} from '@/components/ui/sortable';
import { cn, thumbhashToDataUrl } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import { getLocale } from '@/paraglide/runtime';
import type { TBannerImageDto } from '@/features/banners/dtos/banner-image.ts';
import type { TBannerRowDto } from '@/features/banners/dtos/banner-row.ts';
import { useBannerReorderSheet } from './provider.tsx';


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
      staleTime: 0
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.admin.banners.getAll.key() })
  });

  const isDirty = !sameOrder(items, banners);

  const onSave = () => {
    toast.promise(reorder(items.map((banner) => banner.id)), {
      loading: m['pages.banners.sheet.reorder_saving'](),
      success: () => {
        close();
        return m['pages.banners.sheet.reorder_success']();
      },
      error: (err: Error) => err?.message ?? m['pages.banners.sheet.reorder_error']()
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
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>{m['pages.banners.sheet.reorder_title']()}</SheetTitle>
          <SheetDescription>{m['pages.banners.sheet.reorder_description']()}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="@container flex-1 overflow-y-auto mr-2 my-2" type="always">
          {loading ? (
            <div className="grid grid-cols-2 @lg:grid-cols-3 gap-2 px-4 py-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <ReorderRowSkeleton key={i}/>
              ))}
            </div>
          ) : (
            <Sortable
              value={items}
              onValueChange={setItems}
              getItemValue={(banner) => banner.id}
              orientation="mixed"
            >
              <SortableContent className="grid grid-cols-2 @lg:grid-cols-3 gap-2 px-4 py-1">
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
    <SortableItem value={banner.id} asHandle asChild>
      <div
        className={cn(
          'flex flex-col gap-2 rounded-md border bg-card p-2 select-none touch-none cursor-grab active:cursor-grabbing',
          overlay && 'shadow-lg'
        )}
      >
        <span className={cn('truncate text-sm', !title && 'text-muted-foreground')}>
          {title || m['pages.banners.index.untitled']()}
        </span>

        <div className="flex h-24 items-end gap-2">
          <BannerThumb image={banner.image}/>
        </div>
      </div>
    </SortableItem>
  );
}

function ReorderRowSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-2">
      <Skeleton className="h-4 w-full"/>
      <div className="flex h-24 items-end gap-2">
        <Skeleton className="h-full aspect-video rounded-sm"/>
      </div>
    </div>
  );
}

function BannerThumb({ image }: { image?: TBannerImageDto | null }) {
  const placeholder = thumbhashToDataUrl(image?.thumbhash);

  return (
    <div
      className={cn(
        'flex h-full items-center justify-center overflow-hidden rounded-sm border bg-muted bg-cover bg-center aspect-video'
      )}
      style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
    >
      {image ? (
        <img
          src={image.url}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover select-none pointer-events-none [-webkit-touch-callout:none]"
        />
      ) : (
        <IconPhoto className="size-3.5 text-muted-foreground"/>
      )}
    </div>
  );
}
