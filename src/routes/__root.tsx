/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useRouter
} from '@tanstack/react-router';
import appCss from '../styles.css?url';
import { type QueryClient, useQuery } from '@tanstack/react-query';
import { envConfig } from '@/lib/config';
import type { TSession, TUser } from '@/lib/auth/server.ts';
import { type FC, type ReactNode, useEffect, useRef } from 'react';
import { orpc } from '@/lib/orpc';
import { getZodErrorMap } from '@/lib/zod';
import { getLocale } from '@/paraglide/runtime';
import { z } from 'zod';
import { ConfirmDialogProvider } from '@/components/ui/confirm-dialog.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import { RouteProgressController, RouteProgressProvider } from '@/components/layout/common/route-progress.tsx';


interface IRouterContext {
  queryClient: QueryClient;
  session?: TSession | null;
  user?: TUser | null;
}


export const Route = createRootRouteWithContext<IRouterContext>()({
  beforeLoad: async ({ context: { queryClient } }) => {
    const [res] = await Promise.all([
      queryClient.ensureQueryData(orpc.sessions.current.queryOptions()).catch(() => null),
      queryClient.ensureQueryData(orpc.categories.getTree.queryOptions({ input: { depth: 2 } })).catch(() => null),
      queryClient.ensureQueryData(orpc.products.getFavorites.queryOptions()).catch(() => null),
      queryClient.ensureQueryData(orpc.checkout.getCart.queryOptions()).catch(() => null),
    ]);

    return { session: res?.session, user: res?.user };
  },
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: envConfig.appName }
    ],
    links: [
      { rel: 'stylesheet', href: appCss }
    ]
  }),
  shellComponent: RootDocument
});


function RootDocument({ children }: { children: ReactNode }) {
  const locale = getLocale();

  useEffect(() => {
    getZodErrorMap(locale)
      .then((res) => z.config(res));
  }, []);

  return (
    <html lang={locale} suppressHydrationWarning>
    <head>
      <HeadContent/>
    </head>

    <body className="bg-background antialiased wrap-anywhere min-h-svh flex flex-col dark">
    <RouteProgressProvider>
      <ConfirmDialogProvider>
        {children}
        <Toaster/>
        <RouteProgressController/>
      </ConfirmDialogProvider>
    </RouteProgressProvider>

    <Scripts/>
    <RouterInvalidation/>
    </body>
    </html>
  );
}

// Invalidates route if session change
const RouterInvalidation: FC = () => {
  const router = useRouter();
  const { data: authRes } = useQuery({
    ...orpc.sessions.current.queryOptions(),
    retry: false
  });
  const prevSession = useRef<TSession | null>(authRes?.session);

  useEffect(() => {
    if (authRes?.session === prevSession.current)
      return;

    prevSession.current = authRes?.session;
    void router.invalidate();
  }, [authRes]);

  return null;
};
