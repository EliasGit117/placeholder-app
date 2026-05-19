import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { GallerySectionsTable } from '../-components/gallery-sections-table';
import { roleHasPermission } from '@/lib/auth';
import { awaitIfServer } from '@/lib/server';
import { searchGallerySectionsRequestDtoSchema } from '@/features/gallery-sections/dtos/search-gallery-section.ts';



export const Route = createFileRoute('/admin/gallery/sections/')({
  component: RouteComponent,
  validateSearch: searchGallerySectionsRequestDtoSchema,
  beforeLoad: async ({ context: { user } }) => {
    const canList = await roleHasPermission(user?.role, { gallerySections: ['list'] });
    if (canList) {
      const [canCreate, canUpdate, canDelete] = await Promise.all([
        roleHasPermission(user?.role, { gallerySections: ['create'] }),
        roleHasPermission(user?.role, { gallerySections: ['update'] }),
        roleHasPermission(user?.role, { gallerySections: ['delete'] }),
      ]);
      return { canCreate, canUpdate, canDelete };
    }

    throw redirect({ to: '/', replace: true });
  },
  loaderDeps: (deps) => deps,
  loader: async ({ context: { queryClient }, deps: { search } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery({
        ...orpc.admin.gallery.sections.search.queryOptions({ input: search }),
      })
    );
  },
});


function RouteComponent() {
  const search = Route.useSearch();
  const { canCreate, canUpdate, canDelete } = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <GallerySectionsTable
        search={search}
        canCreate={canCreate}
        canUpdate={canUpdate}
        canDelete={canDelete}
      />
    </div>
  );
}
