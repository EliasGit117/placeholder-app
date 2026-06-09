import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { BannerForm } from './-components/banner-form';


const paramsSchema = z.object({ bannerId: z.coerce.number().int().positive() });


export const Route = createFileRoute('/admin/banners/$bannerId/')({
  component: RouteComponent,
  params: {
    parse: (raw) => paramsSchema.parse(raw),
    stringify: ({ bannerId }) => ({ bannerId: String(bannerId) }),
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { banners: ['get'] });
    if (!canGet)
      throw redirect({ to: '/', replace: true });
  },
  loader: async ({ params: { bannerId } }) => {
    const banner = await orpc.admin.banners.getById.call({ id: bannerId });
    return { banner };
  },
});


function RouteComponent() {
  const { bannerId } = Route.useParams();
  const { banner } = Route.useLoaderData();
  return <BannerForm id={bannerId} initialData={banner}/>;
}
