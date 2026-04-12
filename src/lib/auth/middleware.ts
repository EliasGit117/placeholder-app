import { base } from '@/features/shared/orpc/base.ts';
import { auth } from '@/lib/auth';
import { ORPCError } from '@orpc/server';

export const authMiddleware = base.middleware(async ({ context, next }) => {
  const sessionData = await auth.api.getSession({
    headers: context.headers
  });

  if (!context.headers)
    console.error('Missing headers in auth middleware', context)

  if (!sessionData?.session || !sessionData?.user)
    throw new ORPCError('UNAUTHORIZED')

  return next({
    context: {
      session: sessionData.session,
      user: sessionData.user
    },
  })
})

