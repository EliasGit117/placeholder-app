import type { User } from '~/prisma/generated/prisma/client.ts';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { userBriefDtoSchema } from '@/features/users/admin/dtos/user-brief.ts';
import { z } from 'zod';


const sortableFields: (keyof User)[] = [
  'id',
  'name',
  'email',
  'role',
  'createdAt',
  'updatedAt',
];

export const searchUsersRequestDtoSchema = paginatedRequestDtoSchema.extend({
  id: z.string().optional().catch(undefined),
  sort: z.enum(sortableFields).optional().catch(undefined),
  name: z.string().optional().catch(undefined),
  email: z.string().optional().catch(undefined),
  role: z.array(z.string()).optional().catch(undefined),
  banned: z.boolean().optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
});

export type TSearchUsersRequestDto = z.infer<typeof searchUsersRequestDtoSchema>;
export const searchUsersResultDtoSchema = paginationResultWithCountDtoSchema(userBriefDtoSchema);