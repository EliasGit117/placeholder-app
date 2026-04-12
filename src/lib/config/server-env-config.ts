import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(10),
});

const serverEnv = serverEnvSchema.parse(process.env);

export const serverEnvConfig = {
  dbUrl: serverEnv.DATABASE_URL,
  betterAuthSecret: serverEnv.BETTER_AUTH_SECRET,
  isProduction: serverEnv.NODE_ENV === 'production',
} as const;