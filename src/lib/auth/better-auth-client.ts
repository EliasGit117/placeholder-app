import { createAuthClient } from 'better-auth/react';
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins';
import { accessControl, roles } from './permissions';
import type { auth } from './better-auth.ts';


export const authClient = createAuthClient({
  // No baseURL: auth is always served from the same origin as the app, so
  // this resolves relative to the current page instead of a build-time-baked
  // VITE_APP_BASE_URL (which would wrongly point at localhost in prod if unset
  // at build time).
  fetchOptions: {
    onError: (error) => {
      console.error('Auth client error:', error);
    }
  },
  plugins: [
    adminClient({ ac: accessControl, roles: roles, }),
    inferAdditionalFields<typeof auth>(),
  ]
});