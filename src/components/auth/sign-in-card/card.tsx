import type { ComponentProps, FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils';
import { IconMail, IconSend } from '@tabler/icons-react';
import { Link, type LinkOptions } from '@tanstack/react-router';
import { SignInForm, signInSchema, type TSignInSchema } from './form';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button.tsx';
import { orpc } from '@/lib/orpc';
import { authClient } from '@/lib/auth/better-auth-client.ts';


interface ISignInCard extends ComponentProps<typeof Card> {
  signUpPath?: LinkOptions['to'];
  magicLinkPath?: LinkOptions['to'];
}

export const SignInCard: FC<ISignInCard> = ({ className, signUpPath, magicLinkPath, ...props }) => {
  const queryClient = useQueryClient();
  const form = useForm<TSignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', rememberMe: true }
  });

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: ({ email, password, rememberMe }: TSignInSchema) => authClient.signIn.email({
      email,
      password,
      rememberMe
    }),
    onSuccess: (res) => {
      if (!res.error) {
        void queryClient.invalidateQueries({ queryKey: orpc.sessions.current.queryKey() });
        return;
      }

      throw new Error(res.error.message);
    },
    onError: (e) => {
      toast.error(m['common.error'](), { description: e.message });
    }
  });

  return (
    <Card className={cn('w-full max-w-sm', className)} {...props}>
      <CardHeader>
        <CardTitle>
          {m['components.auth.sign_in_card.title']()}
        </CardTitle>
        <CardDescription>
          {m['components.auth.sign_in_card.description']()}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignInForm form={form} onSubmit={signIn} disabled={isPending} id="sign-in-form"/>
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <LoadingButton className="w-full" loading={isPending} form="sign-in-form">
          <IconSend/>
          <span>{m['common.submit']()}</span>
        </LoadingButton>

        {!!magicLinkPath && (
          <Button
            variant="secondary"
            className={cn('w-full', isPending && 'opacity-50')}
            disabled={isPending}
            asChild
          >
            <Link to={magicLinkPath}>
              <IconMail/>
              <span>{m['components.auth.sign_in_card.magic_link']()}</span>
            </Link>
          </Button>
        )}

        {!!signUpPath && (
          <div className="flex text-center gap-2 text-muted-foreground">
            <p>
              {m['components.auth.sign_in_card.dont_have_account']()}
            </p>

            <Link to={signUpPath} className="underline underline-offset-4">
              {m['components.auth.sign_in_card.create']()}
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
