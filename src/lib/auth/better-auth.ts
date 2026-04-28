import { envConfig } from '@/lib/config';
import { betterAuth } from 'better-auth';
import { prisma } from '@/lib/db';
import { serverEnvConfig } from '@/lib/config/server-env-config.ts';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { admin, openAPI } from 'better-auth/plugins';
import { accessControl, roles } from './permissions';


export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  experimental: { joins: true },
  trustedOrigins: [envConfig.appBaseUrl],
  secret: serverEnvConfig.betterAuthSecret,
  emailAndPassword: { enabled: true },
  plugins: [
    tanstackStartCookies(),
    openAPI({ disableDefaultReference: true }),
    admin({
      ac: accessControl,
      roles: roles
    })
  ]
});