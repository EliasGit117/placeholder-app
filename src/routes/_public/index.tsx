import { createFileRoute } from '@tanstack/react-router';
import { SkineryLanding } from './-components/landing.tsx';


export const Route = createFileRoute('/_public/')({
  component: App,
});

function App() {
  return <SkineryLanding />;
}
