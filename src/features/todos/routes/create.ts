import { prisma } from '@/lib/db/prisma.ts';
import { todosBase } from '@/features/todos/routes/base.ts';
import { createTodoSchema } from '@/features/todos/schemas/create-todo.ts';
import { todoSchema, type TTodo } from '@/features/todos/schemas/todo.ts';


export const createTodo = todosBase
  .route({
    method: 'POST',
    summary: 'Create todo',
    description: 'Create a new todo',
  })
  .input(createTodoSchema)
  .output(todoSchema)
  .errors({ FORBIDDEN: {} })
  .handler(async ({ input }) => {

    const entity = await prisma.todo.create({ data: input });

    return ({
      id: entity.id,
      title: entity.title,
      description: entity.description ?? undefined,
      state: entity.state,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    } satisfies TTodo);
  });