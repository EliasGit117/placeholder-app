import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';
import { UploadImagesSheet, UploadImagesSheetProvider } from './-components/upload-images';
import { SectionImages } from './-components/section-images';
import { ImageSelectionProvider } from './-components/image-selection';
import { ImageReorderProvider } from './-components/image-reorder';


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
    const sectionPromise = queryClient.fetchQuery(orpc.admin.gallery.sections.getById.queryOptions({ input: { id: sectionId } }));
    await awaitIfServer(queryClient.prefetchQuery(orpc.admin.gallery.sections.getImages.queryOptions({ input: { sectionId } })));

    const section = await sectionPromise;
    if (!section)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: section[`name${capitalizeFirst(locale)}`] }];
    return { crumbs };
  }
});


function RouteComponent() {
  const { sectionId } = Route.useParams();
  const { canUpdate, canDelete } = Route.useRouteContext();

  return (
    <UploadImagesSheetProvider>
      <ImageReorderProvider sectionId={sectionId}>
        <ImageSelectionProvider sectionId={sectionId}>
          <SectionImages sectionId={sectionId} canUpdate={canUpdate} canDelete={canDelete}/>
        </ImageSelectionProvider>
      </ImageReorderProvider>
      <UploadImagesSheet/>
    </UploadImagesSheetProvider>
  );
}
