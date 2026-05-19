import { createFileRoute, notFound, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { m } from '@/paraglide/messages';
import { Input } from '@/components/ui/input';


export const Route = createFileRoute('/admin/gallery/sections/$sectionId/')({
  staticData: { crumbs: { title: () => m['pages.gallery_sections.detail.title']() } },
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
