import { createFileRoute } from '@tanstack/react-router'
import { SignInCard } from '@/components/auth/sign-in-card';


export const Route = createFileRoute('/auth/sign-in/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className='w-full h-full flex-1 flex flex-col flex-center p-4'>
      <SignInCard className='min-w-xs -mt-20'/>
    </main>
  )
}
