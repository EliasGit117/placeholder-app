import { createFileRoute } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { m } from '@/paraglide/messages';
import { OrderSummary } from './-components/order-summary.tsx';
import { PaymentForm } from './-components/payment-form.tsx';

export const Route = createFileRoute('/_public/checkout/')({
  component: RouteComponent,
  staticData: {
    crumbs: [
      { title: () => m['components.header.products'](), link: { to: '/products' } },
      { title: () => m['pages.checkout.breadcrumb_current']() }
    ]
  },
  loader: async ({ context: { queryClient } }) => {
    const cart = await queryClient.ensureQueryData(orpc.checkout.getCart.queryOptions());
    const ids = cart.map((item) => item.id);

    if (ids.length > 0) {
      await queryClient.ensureQueryData(orpc.products.getProductsById.queryOptions({ input: { ids } }));
    }
  },
});

function RouteComponent() {
  return (
    <main className="flex flex-1 flex-col bg-background min-h-safe-screen mt-2 mb-12">
      <div className="container mx-auto flex flex-col gap-6 p-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold lg:text-3xl">{m['pages.checkout.title']()}</h1>
          <p className="text-sm text-muted-foreground">{m['pages.checkout.description']()}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
          <OrderSummary/>
          <PaymentForm/>
        </div>
      </div>
    </main>
  );
}
