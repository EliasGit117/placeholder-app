import { usersAdminBase, usersAdminPath } from '@/features/users/admin/routes/base.ts';
import { auth } from '@/lib/auth/better-auth.ts';
import {
  searchUsersRequestDtoSchema,
  searchUsersResultDtoSchema,
  type TSearchUsersRequestDto
} from '@/features/users/admin/dtos/search-users.ts';
import { authMiddleware } from '@/lib/auth/middleware.ts';
import { prisma } from '@/lib/db';
import { PaginationResultDtoFactory } from '@/features/shared/dtos/pagination-result-dto.ts';
import { UserBriefDtoFactory } from '@/features/users/admin/dtos/user-brief.ts';
import { Prisma } from '~/prisma/generated/prisma/client.ts';


export const adminUsersSearch = usersAdminBase
  .route({
    method: 'POST',
    path: `${usersAdminPath}/search`,
    summary: 'Search users',
    description: 'Returns paginated list of users'
  })
  .errors({
    FORBIDDEN: {}
  })
  .use(authMiddleware)
  .input(searchUsersRequestDtoSchema)
  .output(searchUsersResultDtoSchema)
  .handler(async ({ input, context: { user }, errors }) => {
    const { success } = await auth.api.userHasPermission({
      body: { userId: user.id, permissions: { user: ['list'] } }
    });

    if (!success)
      throw errors.FORBIDDEN();

    const [items, meta] = await prisma.user
      .paginate({
        where: getWhere(input),
        orderBy: { [input.sort ?? 'createdAt']: input.dir ?? 'desc' },
      })
      .withPages({
        page: input.page ?? 1,
        limit: input.limit ?? 10,
        includePageCount: true
      });

    return PaginationResultDtoFactory.getWithCount(UserBriefDtoFactory.fromEntities(items), meta);
  });


function getWhere(input: TSearchUsersRequestDto): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (input.id != null)
    where.id = input.id;

  if (input.name != null)
    where.name = { contains: input.name, mode: 'insensitive' };

  if (input.email != null)
    where.email = { contains: input.email, mode: 'insensitive' };

  if (input.role != null)
    where.role =  { in: input.role, mode: 'insensitive' };

  if (input.banned != null)
    where.banned = input.banned;

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

  return where;
}
