import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { orpc } from '@/lib/orpc';
import { roleHasPermission } from '@/lib/auth';
import { getLocale } from '@/paraglide/runtime';
import { capitalizeFirst } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs.tsx';
import { BannerForm } from './-components/banner-form';


const paramsSchema = z.object({ bannerId: z.coerce.number().int().positive() });


export const Route = createFileRoute('/admin/banners/$bannerId/')({
  component: RouteComponent,
  params: {
    parse: (raw) => paramsSchema.parse(raw),
    stringify: ({ bannerId }) => ({ bannerId: String(bannerId) })
  },
  beforeLoad: async ({ context: { user } }) => {
    const canGet = await roleHasPermission(user?.role, { banners: ['get'] });
    if (!canGet)
      throw redirect({ to: '/', replace: true });
  },
  loader: async ({ params: { bannerId } }) => {
    const banner = await orpc.admin.banners.getById.call({ id: bannerId });

    const locale = getLocale();
    const title = banner[`title${capitalizeFirst(locale)}`] || m['pages.banners.index.untitled']();
    const crumbs: IBreadcrumb[] = [{ title }];

    return { banner, crumbs };
  }
});


function RouteComponent() {
  const { bannerId } = Route.useParams();
  const { banner } = Route.useLoaderData();

  return (
    <div className='space-y-4'>
      <BannerForm id={bannerId} initialData={banner}/>
    </div>
  );
}
