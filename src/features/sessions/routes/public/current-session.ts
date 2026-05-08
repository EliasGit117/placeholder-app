import { type } from '@orpc/server';
import { auth, type TSession, type TUser } from '@/lib/auth/server.ts';
import { sessionsPublicBase, sessionsPublicPath } from '@/features/sessions/routes/public/base.ts';

interface IGetSessionResponse {
  session?: TSession | null;
  user?: TUser | null;
}

export const getCurrentSession = sessionsPublicBase
  .route({
    method: 'GET',
    path: `${sessionsPublicPath}/current`,
    summary: 'Get current session',
    description: 'Returns current session if user is authorized'
  })
  .output(type<IGetSessionResponse>())
  .handler(async ({ context: { headers } }) => {
    const sessionData = await auth.api.getSession({ headers: headers });

    return ({
      session: sessionData?.session ?? null,
      user: sessionData?.user ?? null
    });
  });