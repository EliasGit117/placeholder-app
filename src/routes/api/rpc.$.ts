import { RPCHandler } from '@orpc/server/fetch';
import { createFileRoute } from '@tanstack/react-router';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { ResponseHeadersPlugin } from '@orpc/server/plugins';
import { LoggingHandlerPlugin } from '@orpc/experimental-pino';
import { orpcRouter } from '@/features/shared/orpc/router.ts';
import { logger } from '@/lib/logger.ts';


const handler = new RPCHandler(orpcRouter, {
  plugins: [
    new ResponseHeadersPlugin(),
    new LoggingHandlerPlugin({ logger, logRequestResponse: true })
  ]
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: '/api/rpc',
    context: {
      headers: getRequestHeaders()
    }
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/rpc/$')({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle
    }
  }
});
