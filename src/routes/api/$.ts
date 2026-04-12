import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { SmartCoercionPlugin } from '@orpc/json-schema';
import { createFileRoute } from '@tanstack/react-router';
import { onError } from '@orpc/server';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { orpcRouter } from '@/features/shared/orpc/router.ts';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { envConfig } from '@/lib/config';



const handler = new OpenAPIHandler(orpcRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    })
  ],
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()]
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        servers: [{ url: `${envConfig.appBaseUrl}/api` }],
        info: {
          title: 'API',
          version: '1.0.0'
        },
        commonSchemas: {
        },
        security: [],
        components: {
          securitySchemes: {}
        }
      },
      docsConfig: {
        authentication: {
          securitySchemes: {}
        }
      }
    })
  ]
});


const LOCALE_PATTERN = /^\/[a-z]{2}(\/.*)$/;

async function handle({ request }: { request: Request }) {
  // A trick to handle paraglide url strategy
  const url = new URL(request.url);
  const pathWithoutLocale = url.pathname.replace(LOCALE_PATTERN, '$1');
  const newUrl = new URL(request.url);
  newUrl.pathname = pathWithoutLocale;

  const newRequest = new Request(newUrl, request);

  const { response } = await handler.handle(newRequest, {
    prefix: '/api',
    context: {
      headers: getRequestHeaders()
    }
  });

  return response ?? new Response('Not Found', { status: 404 });
}

export const Route = createFileRoute('/api/$')({
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
