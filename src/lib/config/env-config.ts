import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  VITE_APP_NAME: z.string().min(1).default('PLACEHOLDER'),
});

const clientEnv = envSchema.parse(import.meta.env);

export const envConfig = {
  appName: clientEnv.VITE_APP_NAME,
  isProduction: clientEnv.NODE_ENV === 'production',
} as const;
