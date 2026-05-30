import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst, thumbhashToDataUrl } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';
import { m } from '@/paraglide/messages';
import {
  UploadImagesSheet,
  UploadImagesSheetProvider,
  UploadImagesSheetTrigger
} from './-components/upload-images';


export const Route = createFileRoute('/admin/gallery/sections/$sectionId/')({
  component: RouteComponent,
  params: {
    parse: ({ sectionId }) => ({ sectionId: parseInt(sectionId, 10) }),
    stringify: ({ sectionId }) => ({ sectionId: String(sectionId) })
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { gallerySections: ['get'] });
    if (!canGet)
      throw redirect({ to: '/admin/gallery/sections', replace: true });

    const canUpdate = await roleHasPermission(user?.role, { gallerySections: ['update'] });
    const canDelete = await roleHasPermission(user?.role, { gallerySections: ['delete'] });
    return { canUpdate, canDelete };
  },
  loader: async ({ context: { queryClient }, params: { sectionId } }) => {
    const [section] = await Promise.all([
      queryClient.fetchQuery(
        orpc.admin.gallery.sections.getById.queryOptions({ input: { id: sectionId } })
      ),
      queryClient.prefetchQuery(
        orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })
      )
    ]);

    if (!section)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: section[`name${capitalizeFirst(locale)}`] }];
    return { crumbs };
  }
});


function RouteComponent() {
  const { sectionId } = Route.useParams();
  const { canUpdate } = Route.useRouteContext();

  const { data: images = [], isPending: isPendingImages } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })
  );

  return (
    <UploadImagesSheetProvider>
      <div className="space-y-4">
        {canUpdate && (
          <div className="flex items-center gap-2">
            <UploadImagesSheetTrigger options={{ sectionId }} size="sm" variant="ghost" className="ml-auto"/>
          </div>
        )}

        {isPendingImages ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg"/>
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m['pages.gallery_sections.detail.no_images']()}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => {
              // Fall back to the original when a thumbnail is missing.
              const small = img.variants.thumb256?.url ?? img.url;
              const large = img.variants.thumb512?.url ?? small;
              const placeholder = thumbhashToDataUrl(img.thumbhash);

              return (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg border bg-muted bg-cover bg-center"
                  style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
                >
                  <picture className="block h-full w-full">
                    {/* 256 on mobile, 512 from the sm breakpoint (640px) up */}
                    <source media="(min-width: 640px)" srcSet={large}/>
                    <img
                      src={small}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </picture>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <UploadImagesSheet/>
    </UploadImagesSheetProvider>
  );
}
