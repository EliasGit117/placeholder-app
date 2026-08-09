import { createRouter as createTanStackRouter, useRouterState } from '@tanstack/react-router';
import type { IBreadcrumb } from '@/components/layout/admin/breadcrumbs';
import { routeTree } from './routeTree.gen';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { RootProvider } from '@/providers';
import { QueryClient } from '@tanstack/react-query';
import { deLocalizeUrl, localizeUrl } from '@/paraglide/runtime';
import { PageNotFound } from '@/components/layout/errors/page-not-found.tsx';
import { MainLayout } from '@/components/layout/main';
import { SomethingWentWrong } from '@/components/layout/errors/something-went-wrong.tsx';


export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 10_000,
        gcTime: 10_000
      }
    }
  });

  const router = createTanStackRouter({
    routeTree: routeTree,
    rewrite: {
      input: ({ url }) => deLocalizeUrl(url),
      output: ({ url }) => localizeUrl(url)
    },
    context: {
      queryClient: queryClient
    },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    defaultNotFoundComponent:  () => {
      const matches = useRouterState({ select: (state) => state.matches });
      const isPublic = matches.some((match) => match.routeId.startsWith('/_public'));

      if (!isPublic)
        return <PageNotFound className='-mt-12'/>;

      return (
        <MainLayout>
          <PageNotFound className="min-h-safe-screen -mt-12"/>
        </MainLayout>
      );
    },
    defaultErrorComponent: (props) => {
      const matches = useRouterState({ select: (state) => state.matches });
      const isPublic = matches.some((match) => match.routeId.startsWith('/_public'));

      if (!isPublic)
        return <SomethingWentWrong className="-mt-12" {...props}/>;

      return (
        <MainLayout>
          <SomethingWentWrong className="min-h-safe-screen -mt-12" {...props}/>
        </MainLayout>
      )
    },
    Wrap: ({ children }) => (
      <RootProvider>
        {children}
      </RootProvider>
    )
  });

  setupRouterSsrQueryIntegration({ router, queryClient: queryClient });

  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }

  interface StaticDataRouteOption {
    crumbs?: IBreadcrumb | IBreadcrumb[];
    hideCrumbs?: boolean;
  }
}
