import { createFileRoute } from '@tanstack/react-router';
import { SignUpCard } from '@/components/auth/sign-up-card';



export const Route = createFileRoute('/auth/sign-up/')({
  component: RouteComponent
});


function RouteComponent() {
  return (
    <main className='w-full h-full flex-1 flex flex-col flex-center p-4'>
      <SignUpCard className='min-w-xs -mt-20'/>
    </main>
  );
}
