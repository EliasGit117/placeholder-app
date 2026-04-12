import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.tsx';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  IconArrowRight,
  IconBolt,
  IconChecklist,
  IconLayoutDashboard,
  IconShieldCheck
} from '@tabler/icons-react';

export const Route = createFileRoute('/')({ component: App });

const highlights = [
  {
    title: 'Fast workflows',
    description: 'Move from setup to shipping with a homepage that actually guides the next action.',
    icon: IconBolt
  },
  {
    title: 'Operational clarity',
    description: 'Surface what matters first so the screen feels like a product, not a placeholder.',
    icon: IconLayoutDashboard
  },
  {
    title: 'Ready for growth',
    description: 'The structure scales into dashboards, onboarding, or internal tooling without a redesign.',
    icon: IconShieldCheck
  }
];

function App() {
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
              Product home
            </Badge>

            <div className="max-w-xl space-y-2.5">
              <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                A homepage that feels like a real app, not a scaffold.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                This front page now gives the product a clear center of gravity: what it is,
                where to go next, and why the interface exists.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Button asChild>
                <Link to="/todos">
                  Open todos
                  <IconArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-background/70">
                <Link to="/sign-up">Create account</Link>
              </Button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3 mt-auto">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Primary goal</p>
                <p className="mt-1.5 text-sm font-semibold">Guide action fast</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Visual tone</p>
                <p className="mt-1.5 text-sm font-semibold">Warm, focused, clean</p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Next step</p>
                <p className="mt-1.5 text-sm font-semibold">Connect live data</p>
              </div>
            </div>
          </div>

          <Card className="shadow-none">
            <CardHeader className="border-b border-border/60 py-4">
              <Badge variant="secondary" className="w-fit">
                Ready to customize
              </Badge>
              <CardTitle className="text-xl font-semibold">Main workspace</CardTitle>
              <CardDescription className="max-w-sm text-sm leading-5">
                Use this surface as the launch point for tasks, system health, team updates, or
                onboarding.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-[1.5rem] bg-primary p-3 text-primary-foreground">
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-primary-foreground/70">Modules</p>
                  <p className="mt-2 text-2xl font-semibold">03</p>
                  <p className="mt-1 text-xs text-primary-foreground/70">Homepage, todos, API</p>
                </div>
                <div className="rounded-[1.5rem] bg-secondary p-3 text-secondary-foreground">
                  <p className="text-[0.65rem] uppercase tracking-[0.16em] text-secondary-foreground/60">Status</p>
                  <p className="mt-2 text-2xl font-semibold">Live</p>
                  <p className="mt-1 text-xs text-secondary-foreground/60">Ready for richer states</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-dashed border-border bg-background/70 p-4">
                <div className="flex items-start gap-2.5">
                  <div className="rounded-xl bg-accent p-2 text-accent-foreground">
                    <IconChecklist className="size-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Suggested next improvement</p>
                    <p className="text-sm leading-5 text-muted-foreground">
                      Add live stats, recent activity, or a personalized welcome state to turn this
                      from polished shell into useful dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-4 grid gap-3 md:mt-4 md:grid-cols-3">
        {highlights.map(({ title, description, icon: Icon }) => (
          <Card key={title} className='shadow-none'>
            <CardHeader className="space-y-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-4" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-sm leading-5">{description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>
    </main>
  );
}
