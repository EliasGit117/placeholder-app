import { z } from 'zod';
import { TodoState } from '~/prisma/generated/prisma/enums.ts';

export const todoSchema = z.object({
  id: z.number(),

  title: z.string().meta({
    example: 'Buy milk',
    examples: ['Buy milk']
  }),

  description: z.string().optional().meta({
    example: 'Need to buy some milk in the store before Friday',
    examples: ['Need to buy some milk in the store before Friday']
  }),

  state: z.enum(TodoState).meta({
    example: TodoState.TODO,
    examples: Object.values(TodoState)
  }),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TTodo = z.infer<typeof todoSchema>