import { createFileRoute } from '@tanstack/react-router';


export const Route = createFileRoute('/_public/')({ component: App });

function App() {
  return (
    <main className="container mx-auto p-4">

    </main>
  );
}
