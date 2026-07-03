import { createFileRoute, Link, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty';
import { IconHome, IconPhotoOff } from '@tabler/icons-react';
import { m } from '@/paraglide/messages';


export const Route = createFileRoute('/_public/gallery/')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const sections = await queryClient.ensureQueryData(
      orpc.gallery.sections.getAll.queryOptions()
    );

    const first = sections[0];
    if (!first)
      return;

    throw redirect({ to: '/gallery/$slug', params: { slug: first.slug }, replace: true });
  }
});

function RouteComponent() {
  const { data: sections = [] } = useQuery(orpc.gallery.sections.getAll.queryOptions());

  if (sections.length > 0)
    return null;

  return (
    <main className="container mx-auto p-4 pt-0 flex flex-col flex-1">
      <Empty className="-mt-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconPhotoOff/>
          </EmptyMedia>

          <EmptyTitle>
            {m['pages.gallery.no_sections']()}
          </EmptyTitle>

          <EmptyDescription>
            {m['pages.gallery.no_sections_description']()}
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent>
          <Button asChild>
            <Link to="/">
              <IconHome/>
              <span>{m['common.home']()}</span>
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
