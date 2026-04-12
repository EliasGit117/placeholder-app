import { todoSchema } from '@/features/todos/schemas/todo.ts';
import { z } from 'zod';

export const createTodoSchema = todoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  state: true
});

export type TCreateTodo = z.infer<typeof createTodoSchema>;
