import { createFileRoute, Link } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc';
import { m } from '@/paraglide/messages';
import { useCartSheet } from '@/components/cart/cart-sheet';
import { OrderSummary } from './-components/order-summary.tsx';
import { PaymentForm } from './-components/payment-form.tsx';

export const Route = createFileRoute('/_public/checkout/')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const cart = await queryClient.ensureQueryData(orpc.checkout.getCart.queryOptions());
    const ids = cart.map((item) => item.id);

    if (ids.length > 0) {
      await queryClient.ensureQueryData(orpc.products.getProductsById.queryOptions({ input: { ids } }));
    }
  },
});

function RouteComponent() {
  const { open: openCart } = useCartSheet();

  return (
    <main className="flex flex-1 flex-col bg-background min-h-safe-screen mt-2 mb-12">
      <div className="container mx-auto flex flex-col gap-6 p-4">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link to="/products" className="hover:text-foreground hover:underline underline-offset-2">
            {m['components.header.products']()}
          </Link>
          <span>/</span>
          <button type="button" onClick={openCart} className="hover:text-foreground hover:underline underline-offset-2">
            {m['components.header.cart']()}
          </button>
          <span>/</span>
          <span className="text-foreground">{m['pages.checkout.breadcrumb_current']()}</span>
        </nav>

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
