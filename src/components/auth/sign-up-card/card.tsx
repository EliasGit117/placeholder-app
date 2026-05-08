import type { ComponentProps, FC } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { cn } from '@/lib/utils';
import { IconSend } from '@tabler/icons-react';
import { Link, type LinkOptions, useRouter } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { LoadingButton } from '@/components/ui/loading-button.tsx';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';
import { SignUpForm, signUpSchema, type TSignUpSchema } from './form.tsx';
import { zodResolver } from '@hookform/resolvers/zod';
import { authClient } from '@/lib/auth/better-auth-client.ts';


interface ISignUpCard extends ComponentProps<typeof Card> {
  signInPath?: LinkOptions['to'];
}

export const SignUpCard: FC<ISignUpCard> = ({ className, signInPath, ...props }) => {
  const router = useRouter();
  const form = useForm<TSignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const { mutate: signIn, isPending } = useMutation({
    mutationFn: (data: TSignUpSchema) => authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name
    }),
    onSuccess: (res) => {
      if (!res.error) {
        toast.success(m['common.success'](), {
          description: m['components.auth.sign_up_card.success_message'](),
          duration: 5000
        });
        router.navigate({ to: '/auth/sign-in' });
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
          {m['components.auth.sign_up_card.title']()}
        </CardTitle>
        <CardDescription>
          {m['components.auth.sign_up_card.description']()}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <SignUpForm form={form} onSubmit={signIn} disabled={isPending} id="sign-in-form"/>
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <LoadingButton className="w-full" loading={isPending} form="sign-in-form">
          <IconSend/>
          <span>{m['common.submit']()}</span>
        </LoadingButton>

        {!!signInPath && (
          <p className="text-center text-muted-foreground">
            {m['components.auth.sign_up_card.already_have_account']()}
            {' '}
            <Link to={signInPath} className="underline underline-offset-4">
              {m['components.auth.sign_up_card.sign_in']()}
            </Link>
          </p>
        )}
      </CardFooter>
    </Card>
  );
};
