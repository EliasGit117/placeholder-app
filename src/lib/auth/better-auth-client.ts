import { envConfig } from '@/lib/config';
import { createAuthClient } from 'better-auth/react';


export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: envConfig.betterAuthBaseUrl,
  fetchOptions: {
    onError: (error) => {
      console.error('Auth client error:', error);
    }
  },
  plugins: []
});