import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';


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

    const canDelete = await roleHasPermission(user?.role, { gallerySections: ['delete'] });
    return { canDelete };
  },
  loader: async ({ context: { queryClient }, params: { sectionId } }) => {
    const section = await queryClient.fetchQuery(
      orpc.admin.gallery.sections.getById.queryOptions({ input: { id: sectionId } })
    );

    if (!section)
      throw notFound();

    const locale = getLocale();
    const crumbs: IBreadcrumb[] = [{ title: section[`name${capitalizeFirst(locale)}`] }];
    return { crumbs: crumbs };
  }
});


function RouteComponent() {
  const {} = Route.useParams();
  const {} = Route.useRouteContext();

  return (
    <div className="space-y-4">
      <Input id="picture" type="file"/>

      <div className="grid grid-cols-4 gap-4">

      </div>
    </div>
  );
}
