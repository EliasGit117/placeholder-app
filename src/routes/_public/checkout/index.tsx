import { createFileRoute } from '@tanstack/react-router';
import { CheckoutSheet, CheckoutSheetProvider, CheckoutSheetTrigger } from './-components/checkout-sheet/index.ts';


export const Route = createFileRoute('/_public/checkout/')({
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <CheckoutSheetProvider>
      <main className="container mx-auto p-4 flex-1 space-y-4">
        <CheckoutSheetTrigger>
          Open Checkout Sheet
        </CheckoutSheetTrigger>
      </main>

      <CheckoutSheet/>
    </CheckoutSheetProvider>
  );
}
