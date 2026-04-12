import { createRouter as createTanStackRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query';
import { RootProvider } from '@/providers';
import { QueryClient } from '@tanstack/react-query';
import { deLocalizeUrl, localizeUrl } from '@/paraglide/runtime';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 10_000
    }
  }
});

export function getRouter() {

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
}
