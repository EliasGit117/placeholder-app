import { sessionsPublicBase } from '@/features/sessions/public/routes/base.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import { sessionsAdminPath } from '@/features/sessions/admin/routes/base.ts';
import {
  searchSessionsRequestDtoSchema,
  searchSessionsResultDtoSchema, type TSearchSessionsRequestDto
} from '@/features/sessions/common/dtos/search-sessions.ts';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { SessionBriefDtoFactory, SessionState } from '@/features/sessions/admin/dtos/session-brief.ts';
import { Prisma } from '~/prisma/generated/prisma/client.ts';


export const adminSessionsSearch = sessionsPublicBase
  .route({
    method: 'POST',
    path: `${sessionsAdminPath}/search`,
    summary: 'Get current session',
    description: 'Returns current session if user is authorized'
  })
  .errors({
    FORBIDDEN: {}
  })
  .use(authMiddleware)
  .input(searchSessionsRequestDtoSchema)
  .output(searchSessionsResultDtoSchema)
  .handler(async ({ input, context: { user, session }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { session: ['list'] } }
    });

    if (!success)
      throw errors.FORBIDDEN();

    const [items, meta] = await prisma.session
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
        include: {
          user: true
        }
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true
      });

    return PaginationResultDtoFactory.getWithCount(SessionBriefDtoFactory.fromEntities(items, {
      currentSessionId: session.id,
      currentUserId: user!.id
    }), meta);
  });


function getWhere(input: TSearchSessionsRequestDto): Prisma.SessionWhereInput {
  const where: Prisma.SessionWhereInput = {};

  if (input.id != null)
    where.id = input.id;

  if (input.userId != null)
    where.userId = input.userId;

  if (input.ipAddress != null)
    where.ipAddress = {
      contains: input.ipAddress,
      mode: 'insensitive'
    };

  if (input.createdAt?.from != null || input.createdAt?.to != null) {
    where.createdAt = {};

    if (input.createdAt.from != null)
      where.createdAt.gte = input.createdAt.from;

    if (input.createdAt.to != null)
      where.createdAt.lte = input.createdAt.to;
  }

  if (input.updatedAt?.from != null || input.updatedAt?.to != null) {
    where.updatedAt = {};

    if (input.updatedAt.from != null)
      where.updatedAt.gte = input.updatedAt.from;

    if (input.updatedAt.to != null)
      where.updatedAt.lte = input.updatedAt.to;
  }

  if (input.expiresAt?.from != null || input.expiresAt?.to != null) {
    where.expiresAt = {};

    if (input.expiresAt.from != null)
      where.expiresAt.gte = input.expiresAt.from;

    if (input.expiresAt.to != null)
      where.expiresAt.lte = input.expiresAt.to;
  }

  if (input.status != null && input.status.length > 0 && input.status.length < 2) {
    const now = new Date();
    where.expiresAt = input.status[0] === SessionState.Active ? { gt: now } : { lte: now };
  }

  return where;
}