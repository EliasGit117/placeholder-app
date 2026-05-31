import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';


export const Route = createFileRoute('/_public/gallery/')({
  loader: async ({ context: { queryClient } }) => {
    const sections = await queryClient.ensureQueryData(
      orpc.gallery.sections.getAll.queryOptions()
    );

    const first = sections[0];
    if (first) {
      throw redirect({ to: '/gallery/$slug', params: { slug: first.slug }, replace: true });
    }
  },
});
