import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="container mx-auto p-4">
      <header className='space-y-1'>
        <h1 className="text-4xl font-semibold">Main page</h1>
        <p className="text-lg font-normal">Welcome to the app</p>
      </header>
    </main>
  );
}
