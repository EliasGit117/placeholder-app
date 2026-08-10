import { OpenAPIHandler } from '@orpc/openapi/fetch';
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4';
import { SmartCoercionPlugin } from '@orpc/json-schema';
import { createFileRoute } from '@tanstack/react-router';
import { onError } from '@orpc/server';
import { OpenAPIReferencePlugin } from '@orpc/openapi/plugins';
import { orpcRouter } from '@/features/shared/orpc/router.ts';
import { getRequestHeaders } from '@tanstack/react-start/server';
import { envConfig } from '@/lib/config';
import { ResponseHeadersPlugin } from '@orpc/server/plugins'


const handler = new OpenAPIHandler(orpcRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    })
  ],
  plugins: [
    new ResponseHeadersPlugin(),
    new SmartCoercionPlugin({ schemaConverters: [new ZodToJsonSchemaConverter()] }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      renderDocsHtml: (specUrl, title, head, scriptUrl, config) =>
        renderScalarDocsHtml(specUrl, title, head, scriptUrl, config),
      specGenerateOptions: {
        servers: [{ url: `${envConfig.appBaseUrl}/api` }],
        info: {
          title: 'API',
          version: '1.0.0'
        },
        commonSchemas: {},
        security: [],
        components: {
          securitySchemes: {}
        }
      },
      docsConfig: {
        authentication: {
          securitySchemes: {}
        },
        sources: [
          { title: 'Main API', url: '/api/spec.json' },
          { title: 'Auth API', url: '/api/auth/spec.json' }
        ]
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



function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeJsonForHtml(value: unknown) {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027')
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/\//g, '\\u002F');
}

function getScalarConfig(specUrl: string, config: unknown) {
  if (!config || typeof config !== 'object') {
    return { url: specUrl };
  }

  const sources = Reflect.get(config, 'sources');
  if (Array.isArray(sources) && sources.length > 0) {
    return config;
  }

  return { ...config, url: specUrl };
}

function renderScalarDocsHtml(
  specUrl: string,
  title: string,
  head: string,
  scriptUrl: string,
  config: unknown
) {
  const scalarConfig = getScalarConfig(specUrl, config);

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(title)}</title>
        ${head}
      </head>
      <body>
        <div id="app"></div>
        <script src="${escapeHtml(scriptUrl)}"><\/script>
        <script>
          const scalarConfig = ${escapeJsonForHtml(scalarConfig)}
          Scalar.createApiReference('#app', scalarConfig)
        <\/script>
      </body>
    </html>
  `;
}