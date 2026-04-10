import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import { pb } from '@/lib/pocketbase/client.ts'
import { Collections, type TodosResponse } from '@/lib/pocketbase/types.ts'
import { Skeleton } from '@/components/ui/skeleton'


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
      <section aria-labelledby='todos-heading' className='flex flex-col gap-6'>
        <header className='flex flex-col gap-3'>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex flex-col gap-1'>
              <h1 id='todos-heading' className='text-4xl font-semibold'>
                Todos
              </h1>
              <p className='text-lg font-normal'>
                List of the todos in the system
              </p>
            </div>
            <Badge variant='secondary'>{todos.length} items</Badge>
          </div>
        </header>

        {isPending ? (
          <TodosSkeleton />
        ) : error ? (
          <Alert variant='destructive'>
            <AlertTitle>Unable to load todos</AlertTitle>
            <AlertDescription>
              The request failed before the todo list could be rendered.
            </AlertDescription>
          </Alert>
        ) : todos.length > 0 ? (
          <ul aria-label='Todo items' className='flex flex-col gap-4'>
            {todos.map((todo) => (
              <TodoListItem key={todo.id} todo={todo} />
            ))}
          </ul>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No todos found</EmptyTitle>
              <EmptyDescription>
                Add a todo in PocketBase and it will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
    </main>
  )
}

function TodoListItem({ todo }: { todo: TodosResponse }) {
  return (
    <li>
      <article aria-labelledby={`todo-${todo.id}-title`}>
        <Card>
          <CardHeader className='flex flex-col gap-3'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex flex-col gap-1'>
                <CardTitle id={`todo-${todo.id}-title`}>{todo.title}</CardTitle>
                <CardDescription>
                  Updated {new Date(todo.updated).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge variant='outline'>Todo</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-sm leading-6 text-foreground'>
              {todo.description || 'No description provided.'}
            </p>
          </CardContent>
          <CardFooter className='border-t'>
            <p className='text-sm text-muted-foreground'>User ID: {todo.user}</p>
          </CardFooter>
        </Card>
      </article>
    </li>
  )
}

function TodosSkeleton() {
  return (
    <ul aria-label='Loading todos' aria-busy='true' className='flex flex-col gap-4'>
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index}>
          <Card size='sm'>
            <CardHeader className='flex flex-col gap-3'>
              <Skeleton className='h-5 w-1/3' />
              <Skeleton className='h-4 w-1/4' />
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-5/6' />
            </CardContent>
            <CardFooter className='border-t'>
              <Skeleton className='h-4 w-28' />
            </CardFooter>
          </Card>
        </li>
      ))}
    </ul>
  )
}
