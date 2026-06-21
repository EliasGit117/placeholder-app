import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { SkineryLanding } from './-components/landing.tsx';
import { awaitIfServer } from '@/lib/server';


export const Route = createFileRoute('/_public/')({
  component: App,
  loader: async ({ context: { queryClient } }) => {
    await awaitIfServer(Promise.all([
      queryClient.prefetchQuery(orpc.banners.getActive.queryOptions()).catch()
    ]));
  },
  staticData: {
    headerOptions: {
      type: 'fixed'
    }
  }
});

function App() {
  return <SkineryLanding />;
}
