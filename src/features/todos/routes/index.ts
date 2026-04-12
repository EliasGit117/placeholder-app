import { createTodo } from '@/features/todos/routes/create.ts';
import { searchTodos } from '@/features/todos/routes/list.ts';

export const todosRoutes = {
  search: searchTodos,
  create: createTodo
};