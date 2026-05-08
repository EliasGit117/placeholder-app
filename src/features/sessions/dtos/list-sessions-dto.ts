import { Session } from '~/prisma/generated/prisma/client.ts';
import { paginatedSchema } from '@/features/shared/schemas/pagination.ts';
import { z } from 'zod';
import { dateRangeSchema } from '@/components/data-table';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { sessionDtoSchema } from '@/features/sessions/dtos/session-dto.ts';


const sortableFields: (keyof Session)[] = [
  'id',
  'ipAddress',
  'createdAt',
  'updatedAt',
  'expiresAt',
  'userId'
];

export const listSessionsSchema = paginatedSchema.extend({
  sort: z.enum(sortableFields).optional().catch(undefined),
  userId: z.string().optional().catch(undefined),
  ipAddress: z.string().optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
  expiresAt: dateRangeSchema.optional().catch(undefined)
});

export type TListSessions = z.infer<typeof listSessionsSchema>;
export const paginatedSessionSchema = paginationResultWithCountDtoSchema(sessionDtoSchema);

