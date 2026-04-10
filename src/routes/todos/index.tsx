import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase.ts'
import { Collections, type TodosResponse } from '@/lib/pocketbase-types.ts'

export const Route = createFileRoute('/todos/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data, error, isPending } = useQuery({
    queryKey: ['todos'],
    queryFn: () => pb.collection(Collections.Todos).getList(),
  })

  const todos = data?.items ?? []

  return (
    <main className='container mx-auto p-4'>
      <section aria-labelledby='todos-heading' className='space-y-6'>
        <header className='space-y-1'>
          <h1 id='todos-heading' className='text-4xl font-semibold'>
            Todos
          </h1>
          <p className='text-lg font-normal'>List of the todos in the system</p>
        </header>

        {isPending ? (
          <TodosSkeleton />
        ) : error ? (
          <p className='text-base font-medium' role='alert'>
            Unable to load todos right now.
          </p>
        ) : todos.length > 0 ? (
          <ul aria-label='Todo items' className='space-y-4'>
            {todos.map((todo) => (
              <TodoListItem key={todo.id} todo={todo} />
            ))}
          </ul>
        ) : (
          <p className='text-base font-medium'>No todos found.</p>
        )}
      </section>
    </main>
  )
}

function TodoListItem({ todo }: { todo: TodosResponse }) {
  return (
    <li>
      <article className='space-y-2 rounded-xl border p-4'>
        <header className='space-y-1'>
          <h2 className='text-xl font-semibold'>{todo.title}</h2>
          <p className='text-sm font-medium'>
            Updated {new Date(todo.updated).toLocaleDateString()}
          </p>
        </header>

        <p className='text-base font-normal'>
          {todo.description || 'No description provided.'}
        </p>
      </article>
    </li>
  )
}

function TodosSkeleton() {
  return (
    <ul aria-label='Loading todos' className='space-y-4' aria-busy='true'>
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index}>
          <article className='space-y-3 rounded-xl border p-4'>
            <div className='h-6 w-1/3 animate-pulse rounded bg-zinc-200' />
            <div className='h-4 w-1/4 animate-pulse rounded bg-zinc-200' />
            <div className='h-4 w-full animate-pulse rounded bg-zinc-200' />
            <div className='h-4 w-5/6 animate-pulse rounded bg-zinc-200' />
          </article>
        </li>
      ))}
    </ul>
  )
}
