import { envConfig } from '@/lib/config';
import { betterAuth } from 'better-auth';
import { prisma } from '@/lib/db';
import { serverEnvConfig } from '@/lib/config/server-env-config.ts';
import { prismaAdapter } from '@better-auth/prisma-adapter';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { admin, openAPI } from 'better-auth/plugins';
import { accessControl, roles } from './permissions';


export const auth = betterAuth({
  experimental: { joins: true },
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: envConfig.appBaseUrl,
  trustedOrigins: [envConfig.appBaseUrl],
  secret: serverEnvConfig.betterAuthSecret,
  emailAndPassword: { enabled: true },
  plugins: [
    tanstackStartCookies(),
    openAPI({ disableDefaultReference: true }),
    admin({
      defaultRole: 'user',
      ac: accessControl,
      roles: roles
    })
  ]
});

export type TUser = typeof auth.$Infer.Session.user;
export type TSession = typeof auth.$Infer.Session.session;