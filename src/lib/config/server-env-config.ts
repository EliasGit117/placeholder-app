import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(10),
  BETTER_AUTH_URL: z.url(),
  UPLOADTHING_TOKEN: z.string().min(1),

  MAIB_CLIENT_ID: z.string().min(1),
  MAIB_CLIENT_SECRET: z.string().min(1),
  MAIB_SIGNATURE_KEY: z.string().min(1),
  MAIB_USE_SANDBOX: z.enum(['true', 'false']).default('true'),

  REVERIFY_PAYMENTS_ENABLED: z.enum(['true', 'false']).default('false'),
  REVERIFY_PAYMENTS_INTERVAL_MINUTES: z.coerce.number().int().positive().default(5)
});

const serverEnv = serverEnvSchema.parse(process.env);

export const serverEnvConfig = {
  dbUrl: serverEnv.DATABASE_URL,
  uploadthingToken: serverEnv.UPLOADTHING_TOKEN,
  betterAuthSecret: serverEnv.BETTER_AUTH_SECRET,
  appUrl: serverEnv.BETTER_AUTH_URL,
  isProduction: serverEnv.NODE_ENV === 'production',
  maibClientId: serverEnv.MAIB_CLIENT_ID,
  maibClientSecret: serverEnv.MAIB_CLIENT_SECRET,
  maibSignatureKey: serverEnv.MAIB_SIGNATURE_KEY,
  maibUseSandbox: serverEnv.MAIB_USE_SANDBOX === 'true',
  reverifyPaymentsEnabled: serverEnv.REVERIFY_PAYMENTS_ENABLED === 'true',
  reverifyPaymentsIntervalMinutes: serverEnv.REVERIFY_PAYMENTS_INTERVAL_MINUTES,
} as const;