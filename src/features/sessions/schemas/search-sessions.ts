import type { Session } from '~/prisma/generated/prisma/client.ts';
import { dateRangeSchema } from '@/components/data-table';
import { paginatedRequestDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { z } from 'zod';
import { paginationResultWithCountDtoSchema } from '@/features/shared/dtos/pagination-result-dto.ts';
import { sessionBriefDtoSchema } from '@/features/sessions/schemas/session-brief.ts';


const sortableFields: (keyof Session)[] = [
  'id',
  'userId',
  'ipAddress',
  'createdAt',
  'updatedAt',
  'expiresAt',
];

export const sessionStateSchema = z.enum(['active', 'expired']);
export type TSessionState = z.infer<typeof sessionStateSchema>;

export const searchSessionsRequestDtoSchema = paginatedRequestDtoSchema.extend({
  id: z.string().optional().catch(undefined),
  sort: z.enum(sortableFields).optional().catch(undefined),
  userId: z.string().optional().catch(undefined),
  ipAddress: z.string().optional().catch(undefined),
  state: sessionStateSchema.optional().catch(undefined),
  createdAt: dateRangeSchema.optional().catch(undefined),
  updatedAt: dateRangeSchema.optional().catch(undefined),
  expiresAt: dateRangeSchema.optional().catch(undefined)
});

export type TSearchSessionsRequestDto = z.infer<typeof searchSessionsRequestDtoSchema>;
export const searchSessionsResultDtoSchema = paginationResultWithCountDtoSchema(sessionBriefDtoSchema);

