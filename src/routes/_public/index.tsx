import { createFileRoute } from '@tanstack/react-router';
import { SkineryLanding } from './-components/landing.tsx';


export const Route = createFileRoute('/_public/')({
  component: App,
  staticData: {
    headerOptions: {
      type: 'fixed'
    }
  }
});

function App() {
  return <SkineryLanding />;
}
