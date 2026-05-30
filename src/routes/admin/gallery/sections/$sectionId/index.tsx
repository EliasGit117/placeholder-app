import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagePurpose } from '~/prisma/generated/prisma/enums.ts';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';
import { m } from '@/paraglide/messages';
import {
  UploadImagesSheet,
  UploadImagesSheetProvider,
  UploadImagesSheetTrigger,
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
      ),
    ]);

    if (!section)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: section[`name${capitalizeFirst(locale)}`] }];
    return { crumbs };
  }
});


const purposeLabels: Record<ImagePurpose, () => string> = {
  [ImagePurpose.BASE]: () => m['pages.gallery_sections.detail.purpose.base'](),
  [ImagePurpose.THUMB_256x256]: () => m['pages.gallery_sections.detail.purpose.thumb_256'](),
  [ImagePurpose.THUMB_512x512]: () => m['pages.gallery_sections.detail.purpose.thumb_512'](),
};


function RouteComponent() {
  const { sectionId } = Route.useParams();
  const { canUpdate } = Route.useRouteContext();

  const { data: images = [], isPending: isPendingImages } = useQuery(
    orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })
  );

  return (
    <UploadImagesSheetProvider>
      <div className="space-y-6">
        {canUpdate && (
          <div className="flex items-center gap-2">
            <UploadImagesSheetTrigger options={{ sectionId }} size="sm" />
          </div>
        )}

        {isPendingImages ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg"/>
            ))}
          </div>
        ) : images.length === 0 ? (
          <p className="text-sm text-muted-foreground">{m['pages.gallery_sections.detail.no_images']()}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted"
              >
                <img src={img.url} alt="" className="h-full w-full object-cover"/>
                <Badge variant="secondary" className="absolute bottom-1.5 left-1.5 text-xs">
                  {purposeLabels[img.purpose]()}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadImagesSheet />
    </UploadImagesSheetProvider>
  );
}
