import { sessionsAdminBase, sessionsAdminPath } from '@/features/sessions/routes/admin/base.ts';
import { auth, authMiddleware } from '@/lib/auth/server.ts';
import { prisma } from '@/lib/db';
import { revokeSessionsDtoSchema } from '@/features/sessions/dtos/revoke-sessions-dto.ts';
import { type } from '@orpc/server';
import { m } from '@/paraglide/messages';


export const revokeSessions = sessionsAdminBase
  .route({
    method: 'POST',
    path: `${sessionsAdminPath}/revoke`,
    summary: 'Revoke sessions',
    description: 'Revoke list of sessions'
  })
  .use(authMiddleware)
  .input(revokeSessionsDtoSchema)
  .output(type<{ revokedCount: number }>())
  .errors({
    FORBIDDEN: { message: 'You do not have permission to revoke sessions' },
    BAD_REQUEST: {}
  })
  .handler(async ({ input, errors, context: { user, headers, session: sessionFromReq } }) => {
    const canDelete = await auth.api.userHasPermission({
      body: {
        userId: user.id,
        permissions: { session: ['revoke'] }
      }
    });

    if (!canDelete)
      errors.FORBIDDEN({ message: m['common.forbidden']() });

    const sessions = await prisma.session.findMany({ where: { id: { in: input.ids } } });
    if (sessions.length === 0)
      errors.BAD_REQUEST({ message: 'No sessions found with provided IDs' });

    const currentSessionIncluded = sessions.some((s) => s.id === sessionFromReq?.id);

    // Revoke all other sessions in parallel (FAST)
    await Promise.all(
      sessions
        .filter((s) => s.id !== sessionFromReq?.id)
        .map((session) =>
          auth.api.revokeSession({
            headers: headers,
            body: { token: session.token }
          })
        )
    );

    // Sign out current session last if included
    if (currentSessionIncluded)
      await auth.api.signOut({ headers });

    return { revokedCount: sessions.length };
  });