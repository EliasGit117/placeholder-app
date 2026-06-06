import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import type { IBreadcrumb } from '@/components/layout/admin/nav-breadcrumbs';
import { routeTree } from './routeTree.gen';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { RootProvider } from '@/providers';
import { QueryClient } from '@tanstack/react-query';
import { deLocalizeUrl, localizeUrl } from '@/paraglide/runtime';


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
