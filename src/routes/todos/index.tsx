import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.tsx';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle
} from '@/components/ui/empty.tsx';
import { awaitIfServer } from '@/lib/server';
import { orpc } from '@/lib/orpc';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  IconArrowLeft,
  IconChecklist,
  IconClockHour4,
  IconRefresh
} from '@tabler/icons-react';

export const Route = createFileRoute('/todos/')({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    await awaitIfServer(queryClient.ensureQueryData(orpc.todos.search.queryOptions({ input: {} })));
  }
});

function RouteComponent() {
  const { data: result, isPending, isFetching, refetch } = useQuery({
    ...orpc.todos.search.queryOptions({ input: {} }),
    placeholderData: keepPreviousData
  });

  const items = result?.items ?? [];

  return (
    <main className="container mx-auto p-4">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-[linear-gradient(135deg,var(--color-background),var(--color-muted)_45%,var(--color-secondary))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-accent),transparent_28%),radial-gradient(circle_at_bottom_right,var(--color-muted),transparent_30%)] opacity-70" />

        <div className="relative grid gap-4 px-4 py-4 md:px-5 md:py-5 lg:grid-cols-[1.2fr_0.95fr] lg:gap-4">
          <div className="flex flex-col gap-4">
            <Badge
              variant="outline"
              className="border-border bg-background/80 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Tasks
            </Badge>

            <div className="max-w-xl space-y-2.5">
              <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                Keep the todo list visible, tidy, and easy to refresh.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                This page now matches the homepage design language while keeping the live todo data
                front and center.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button asChild variant="outline" className="bg-background/70">
                <Link to="/">
                  <IconArrowLeft />
                  Back home
                </Link>
              </Button>
              <Button asChild>
                <Link to="/api/$" target='_blank'>Open API route</Link>
              </Button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="mt-1.5 text-sm font-semibold">{items.length.toString().padStart(2, '0')}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">State</p>
                <p className="mt-1.5 text-sm font-semibold">{isFetching ? 'Refreshing' : 'Synced'}</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">View</p>
                <p className="mt-1.5 text-sm font-semibold">Compact overview</p>
              </div>
            </div>
          </div>

          <Card className="shadow-none">
            <CardHeader className="border-b border-border/60 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <Badge variant="secondary" className="w-fit">
                    Live collection
                  </Badge>
                  <CardTitle className="text-xl font-semibold">Todo workspace</CardTitle>
                  <CardDescription className="max-w-sm text-sm leading-5">
                    Refresh the list, scan recent entries, and keep the route aligned with the main
                    app shell.
                  </CardDescription>
                </div>

                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => refetch()}
                  disabled={isFetching}
                  aria-label="Refresh todos"
                >
                  <IconRefresh className={isFetching ? 'animate-spin' : ''} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-[1.5rem] bg-primary p-3 text-primary-foreground">
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-primary-foreground/70">Loaded</p>
                  <p className="mt-2 text-2xl font-semibold">{items.length}</p>
                  <p className="mt-1 text-xs text-primary-foreground/70">Todos available now</p>
                </div>
                <div className="rounded-[1.5rem] bg-secondary p-3 text-secondary-foreground">
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-secondary-foreground/60">Refresh</p>
                  <p className="mt-2 text-2xl font-semibold">{isFetching ? 'Now' : 'Manual'}</p>
                  <p className="mt-1 text-xs text-secondary-foreground/60">Use the button to sync</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-4">
                <div className="flex items-start gap-2.5">
                  <div className="rounded-xl bg-accent p-2 text-accent-foreground">
                    <IconChecklist className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Next polish target</p>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Add completion states, filtering, or inline creation so this page becomes a
                      working task hub instead of a read-only list.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-4">
        <Card className="shadow-none">
          <CardHeader className="border-b border-border/60 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">Current todos</CardTitle>
                <CardDescription className="text-sm leading-5">
                  A compact list view styled to match the homepage cards.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-border bg-background/80">
                {isPending ? 'Loading' : `${items.length} items`}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="py-4">
            {isPending ? (
              <div className="space-y-2.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.25rem] border border-border/60 bg-background/70 p-4"
                  >
                    <div className="h-4 w-40 rounded bg-muted" />
                    <div className="mt-2 h-3 w-64 rounded bg-muted/80" />
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <Empty className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-accent text-accent-foreground">
                    <IconChecklist />
                  </EmptyMedia>
                  <EmptyTitle>No todos yet</EmptyTitle>
                  <EmptyDescription>
                    When items are created, they’ll show up here in the same compact card layout.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-2.5">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-[1.25rem] border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <h2 className="text-sm font-semibold">{item.title}</h2>
                        <p className="text-sm leading-5 text-muted-foreground">
                          {item.description || 'No description provided.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        <IconClockHour4 className="size-3.5" />
                        <span>{item.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
