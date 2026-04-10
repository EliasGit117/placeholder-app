import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: App });

function App() {
  return (
    <main className="container mx-auto p-4">
      <header>
        <h1>Main page</h1>
        <p>Welcome to the app</p>
      </header>
    </main>
  );
}
