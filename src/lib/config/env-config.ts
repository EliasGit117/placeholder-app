import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  VITE_APP_NAME: z.string().min(1).default('PLACEHOLDER'),
  VITE_APP_BASE_URL: z.url().default('http://localhost:3000'),
  VITE_BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
});

const clientEnv = envSchema.parse(import.meta.env);

export const envConfig = {
  appName: clientEnv.VITE_APP_NAME,
  appBaseUrl: clientEnv.VITE_APP_BASE_URL,
  isProduction: clientEnv.NODE_ENV === 'production',
  betterAuthBaseUrl: clientEnv.VITE_BETTER_AUTH_URL,
} as const;
