import { createRouterClient } from '@orpc/server';
import { createORPCClient } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { createIsomorphicFn } from '@tanstack/react-start';
import type { RouterClient } from '@orpc/server';
import { orpcRouter } from '@/features/shared/orpc/router.ts';


const getORPCClient = createIsomorphicFn()
  .server(() => createRouterClient(orpcRouter, {
    context: () => ({ headers: getRequestHeaders() })
  }))
  .client((): RouterClient<typeof orpcRouter> => createORPCClient(
    new RPCLink({ url: `${window.location.origin}/api/rpc` })
  ));

export const client: RouterClient<typeof orpcRouter> = getORPCClient();

export const orpc = createTanstackQueryUtils(client, {
  experimental_defaults: {
    
  }
});
