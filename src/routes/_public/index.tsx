import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { SkineryLanding } from './-components/landing.tsx';


export const Route = createFileRoute('/_public/')({
  component: App,
  loader: async ({ context: { queryClient } }) => {
    await awaitIfServer(queryClient.prefetchQuery(orpc.banners.getValid.queryOptions()));
  },
});

function App() {

  return <SkineryLanding />;
}
