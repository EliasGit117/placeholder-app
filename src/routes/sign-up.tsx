import * as React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card.tsx';
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { authClient } from '@/lib/auth/better-auth-client.ts';
import { IconArrowLeft, IconArrowRight, IconUserPlus } from '@tabler/icons-react';

export const Route = createFileRoute('/sign-up')({
  component: SignUpRoute
});

function SignUpRoute() {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/todos'
      });

      if (error) {
        setErrorMessage(error.message || 'Unable to create your account.');
        return;
      }

      setSuccessMessage('Account created. Redirecting to your workspace...');
      void navigate({ to: '/todos' });
    } catch {
      setErrorMessage('Something went wrong while creating your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="container mx-auto px-4 pb-6 pt-4 md:px-6 md:pb-8">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-[linear-gradient(135deg,var(--color-background),var(--color-muted)_45%,var(--color-secondary))]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--color-accent),transparent_28%),radial-gradient(circle_at_bottom_right,var(--color-muted),transparent_30%)] opacity-70" />

        <div className="relative grid gap-4 px-4 py-4 md:px-5 md:py-5 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4">
          <div className="flex flex-col gap-4">
            <Badge
              variant="outline"
              className="border-border bg-background/80 px-2.5 py-1 text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              Account
            </Badge>

            <div className="max-w-xl space-y-2.5">
              <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">
                Create an account and step straight into the app.
              </h1>
              <p className="max-w-lg text-sm leading-6 text-muted-foreground md:text-base">
                This sign-up flow uses the Better Auth client already configured in the project and
                keeps the same compact, theme-based visual language as the rest of the product.
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
                <Link to="/todos">
                  Browse app
                  <IconArrowRight />
                </Link>
              </Button>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-md border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Auth</p>
                <p className="mt-1.5 text-sm font-semibold">Better Auth</p>
              </div>
              <div className="rounded-md border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Method</p>
                <p className="mt-1.5 text-sm font-semibold">Email + password</p>
              </div>
              <div className="rounded-md border border-border/70 bg-background/70 p-3 backdrop-blur">
                <p className="text-xs text-muted-foreground">Next stop</p>
                <p className="mt-1.5 text-sm font-semibold">Todo workspace</p>
              </div>
            </div>
          </div>

          <Card className="shadow-none">
            <CardHeader className="border-b border-border/60 py-4">
              <Badge variant="secondary" className="w-fit">
                New account
              </Badge>
              <CardTitle className="text-xl font-semibold">Sign up</CardTitle>
              <CardDescription className="max-w-sm text-sm leading-5">
                Enter your details below to create a local account and start using the app.
              </CardDescription>
            </CardHeader>

            <CardContent className="py-4">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <FieldGroup className="gap-4">
                  <Field>
                    <FieldLabel htmlFor="sign-up-name">Full name</FieldLabel>
                    <FieldContent>
                      <Input
                        id="sign-up-name"
                        name="name"
                        autoComplete="name"
                        placeholder="Alex Example"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
                    <FieldContent>
                      <Input
                        id="sign-up-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </FieldContent>
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                      <FieldContent>
                        <Input
                          id="sign-up-password"
                          name="password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </FieldContent>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="sign-up-confirm-password">Confirm password</FieldLabel>
                      <FieldContent>
                        <Input
                          id="sign-up-confirm-password"
                          name="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </FieldContent>
                    </Field>
                  </div>
                </FieldGroup>

                {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
                {successMessage ? (
                  <p className="text-sm text-muted-foreground">{successMessage}</p>
                ) : null}

                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Already have an account? Sign-in can be added next.
                  </p>
                  <Button type="submit" disabled={isSubmitting}>
                    <IconUserPlus />
                    {isSubmitting ? 'Creating account...' : 'Create account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
