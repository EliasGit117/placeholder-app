import { todosBase } from './base.ts';
import { prisma } from '@/lib/db/prisma.ts';
import {
  todosPaginatedRequestSchema,
  todosPaginatedResultSchema, type TTodosPaginatedResult
} from '@/features/todos/schemas/paginated-todos.ts';
import { path } from './base.ts';


export const searchTodos = todosBase
  .route({
    path: `${path}/search`,
    method: 'POST',
    summary: 'Search todos',
    description: 'Search todos paginated'
  })
  .input(todosPaginatedRequestSchema)
  .output(todosPaginatedResultSchema)
  .handler(async ({ input }) => {

    const totalItemsPromise = prisma.todo.count();
    const todosPromise = prisma.todo.findMany({
      take: input.limit,
      skip: (input.page - 1) * input.limit,
      orderBy: !!input.sort ? { [input.sort]: input.dir } : { createdAt: 'desc' }
    });

    const [todos, totalItems] = await Promise.all([todosPromise, totalItemsPromise]);

    return {
      page: input.page,
      dir: input.dir,
      limit: input.limit,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / input.limit),
      items: todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description ?? undefined,
        state: todo.state,
        createdAt: todo.createdAt,
        updatedAt: todo.updatedAt
      }))
    } satisfies  TTodosPaginatedResult;
  });
