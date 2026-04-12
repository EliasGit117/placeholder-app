import { todoSchema } from '@/features/todos/schemas/todo.ts';
import { z } from 'zod';

export const updateTodoSchema = todoSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
}).partial();

export type TUpdateTodo = z.infer<typeof updateTodoSchema>;