import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { newArrivalsQuery, SkineryLanding } from './-components/landing.tsx';


export const Route = createFileRoute('/_public/')({
  component: App,
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      awaitIfServer(queryClient.prefetchQuery(orpc.banners.getValid.queryOptions())),
      awaitIfServer(queryClient.prefetchQuery(newArrivalsQuery)),
    ]);
  },
});

function App() {

  return <SkineryLanding />;
}
