import { z } from 'zod';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

const minLimit = 1;
const defaultLimit = 10;
const maxLimit = 100;


export const paginatedRequestSchema = z.object({
  page: z.number().int().min(1).default(1).meta({ example: 1, }),

  limit: z.number().int().min(minLimit).max(maxLimit).default(defaultLimit).meta({
    example: defaultLimit,
    examples: getLimitSteps(minLimit, maxLimit, 4)
  }),

  dir: z.enum(SortDirection).optional().meta({
    example: SortDirection.DESC,
    examples: Object.values(SortDirection)
  })
});

export const paginatedResultSchema = paginatedRequestSchema.extend({
  totalItems: z.number().int().min(0).meta({ example: 0 }),
  totalPages: z.number().int().min(1).meta({ example: 1 })
});


export type TPaginatedRequest = z.infer<typeof paginatedRequestSchema>;
export type TPaginatedResult = z.infer<typeof paginatedResultSchema>;


function getLimitSteps(min = minLimit, max = maxLimit, steps = 5): number[] {
  const step = (max - min) / (steps - 1);
  return Array.from({ length: steps }, (_, i) => Math.round(min + i * step));
  // [1, 25, 50, 75, 100]
}