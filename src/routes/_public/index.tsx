import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { awaitIfServer } from '@/lib/server';
import { HeroBannerCarousel } from '@/routes/_public/-components/hero-banner-carousel';
import { About } from '@/routes/_public/-components/about';
import { Categories, categoriesTreeQuery } from '@/routes/_public/-components/categories';
import { Arrivals, newArrivalsQuery } from '@/routes/_public/-components/arrivals';
import { Faq } from '@/routes/_public/-components/faq';


export const Route = createFileRoute('/_public/')({
  component: App,
  staticData: { hideCrumbs: true },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      awaitIfServer(queryClient.prefetchQuery(orpc.banners.getValid.queryOptions())),
      awaitIfServer(queryClient.prefetchQuery(newArrivalsQuery)),
      awaitIfServer(queryClient.prefetchQuery(categoriesTreeQuery)),
    ]);
  },
});

function App() {
  return (
    <div className="flex-1">
      <HeroBannerCarousel className="pt-0"/>
      <About/>
      <Categories/>
      <Arrivals/>
      <Faq/>
    </div>
  );
}
