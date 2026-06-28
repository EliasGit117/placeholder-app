import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { LocaleDropdown } from '@/components/locale';
import authBg from '/images/auth/bg.webp';
import { LogoButton } from '@/components/layout/common';
import { Footer } from '@/components/layout/common/footer.tsx';


export const Route = createFileRoute('/auth')({
  component: RouteComponent,
  beforeLoad: ({ context: { user } }) => {
    if (!user)
      return;

    throw redirect({ to: '/', replace: true });
  }
});

function RouteComponent() {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2 md:justify-start items-center relative p-4">
            <LogoButton className='absolute left-1/2 -translate-x-1/2'/>

            <div className='flex items-center gap-1.5 ml-auto'>
              <LocaleDropdown variant="outline" size="icon"/>
            </div>
          </div>

          <div className="flex flex-1">
            <Outlet/>
          </div>
          <Footer className='mt-auto text-center'/>
        </div>

        <div className="bg-muted relative hidden lg:block">
          <img
            src={authBg}
            alt="Background image"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.5] object-right"
          />

          <div className="backdrop-blur-sm absolute inset-0"/>
        </div>
      </div>
    </>
  );
}
