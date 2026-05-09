import { paginatedRequestDtoSchema, paginatedResultDtoSchema } from '@/features/shared/schemas/pagination.ts';
import { z } from 'zod';
import { todoSchema } from '@/features/todos/schemas/todo.ts';
import { TodoState } from '~/prisma/generated/prisma/enums.ts';


export const todosPaginatedRequestSchema = paginatedRequestDtoSchema.extend({
  sort: z.enum(['title', 'createdAt', 'updatedAt']).optional().meta({
    example: 'title',
    examples: ['title', 'createdAt', 'updatedAt']
  }),
})

export const todosPaginatedResultSchema = paginatedResultDtoSchema.extend({
  items: z.array(todoSchema).meta({
    example: [todoSchema.parse({
      id: 1,
      title: 'Sample Todo',
      state: TodoState.TODO,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z')
    })],
    examples: [
      todoSchema.parse({
        id: 1,
        title: 'Sample Todo',
        state: TodoState.TODO,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z')
      }),
      todoSchema.parse({
        id: 2,
        title: 'Another Todo',
        description: 'Follow up with the client',
        state: TodoState.IN_PROGRESS,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        updatedAt: new Date('2026-01-03T00:00:00.000Z')
      })
    ],
  }),
});


export type TTodosPaginatedRequest = z.infer<typeof todosPaginatedRequestSchema>;
export type TTodosPaginatedResult = z.infer<typeof todosPaginatedResultSchema>;
