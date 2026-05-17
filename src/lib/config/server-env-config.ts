import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(10),
  UPLOADTHING_TOKEN: z.string().min(1)
});

const serverEnv = serverEnvSchema.parse(process.env);

export const serverEnvConfig = {
  dbUrl: serverEnv.DATABASE_URL,
  uploadthingToken: serverEnv.UPLOADTHING_TOKEN,
  betterAuthSecret: serverEnv.BETTER_AUTH_SECRET,
  isProduction: serverEnv.NODE_ENV === 'production',
} as const;