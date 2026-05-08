import { base } from '@/features/shared/orpc/base.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { ORPCError } from '@orpc/server';
import { m } from '@/paraglide/messages';


export const authMiddleware = base.middleware(async ({ context, next }) => {
  const sessionData = await auth.api.getSession({ headers: context.headers });

  if (!context.headers)
    console.error('Missing headers in auth middleware', context);

  if (!sessionData?.session || !sessionData?.user)
    throw new ORPCError('UNAUTHORIZED', { message: m['common.unauthorized']() });

  return next({
    context: { session: sessionData.session, user: sessionData.user }
  });
});

