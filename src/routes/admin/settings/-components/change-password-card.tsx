import { type ComponentProps, type FC, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { authClient } from '@/lib/auth';
import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

const MISMATCH_CODE = 'PASSWORDS_MISMATCH';

const schema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MISMATCH_CODE,
        path: ['confirmPassword'],
      });
    }
  });

type TSchema = z.infer<typeof schema>;

export const ChangePasswordCard: FC<ComponentProps<typeof Card>> = ({ className, ...props }) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: TSchema) => {
      const result = await authClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: false,
      });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      form.reset();
      toast.success(m['pages.settings.security.change_password_success']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  return (
    <Card className={cn('w-full max-w-sm', className)} {...props}>
      <CardHeader>
        <CardTitle>{m['pages.settings.security.change_password']()}</CardTitle>
        <CardDescription>{m['pages.settings.security.change_password_description']()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((data) => mutate(data))}>
          <fieldset disabled={isPending}>
            <FieldGroup className="space-y-3">

              <Controller
                name="currentPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{m['pages.settings.security.current_password']()}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showCurrent ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton size="icon-xs" type="button" onClick={() => setShowCurrent((v) => !v)}>
                          {showCurrent ? <IconEyeOff size={14}/> : <IconEye size={14}/>}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                  </Field>
                )}
              />

              <Controller
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{m['pages.settings.security.new_password']()}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showNew ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton size="icon-xs" type="button" onClick={() => setShowNew((v) => !v)}>
                          {showNew ? <IconEyeOff size={14}/> : <IconEye size={14}/>}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{m['pages.settings.security.confirm_password']()}</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        type={showNew ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError
                        errors={[
                          fieldState.error?.message === MISMATCH_CODE
                            ? { message: m['pages.settings.security.passwords_mismatch']() }
                            : fieldState.error,
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <LoadingButton type="submit" loading={isPending} className="w-full mt-2">
                {m['pages.settings.security.change_password']()}
              </LoadingButton>

            </FieldGroup>
          </fieldset>
        </form>
      </CardContent>
    </Card>
  );
};
