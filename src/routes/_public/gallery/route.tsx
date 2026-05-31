import { createFileRoute, Link, Outlet } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';


export const Route = createFileRoute('/_public/gallery')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await awaitIfServer(
      queryClient.prefetchQuery(orpc.gallery.sections.getAll.queryOptions())
    );
  }
});

function RouteComponent() {
  const { data: sections = [] } = useQuery(orpc.gallery.sections.getAll.queryOptions());

  return (
    <>
      <nav className="container mx-auto px-4 py-2 flex items-center gap-4">
        {sections.map((s) => (
          <Button variant="link" className='p-0' asChild>
            <Link
              key={s.slug}
              to="/gallery/$slug"
              params={{ slug: s.slug }}
              activeProps={{ className: 'underline' }}
            >
              {s.name}
            </Link>
          </Button>
        ))}
      </nav>

      <Outlet/>
    </>
  );
}
