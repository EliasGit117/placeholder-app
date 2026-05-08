import { z } from 'zod';
import { type ComponentProps, type FC, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field.tsx';
import { Input } from '@/components/ui/input.tsx';
import { m } from '@/paraglide/messages';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group.tsx';
import { IconEye, IconEyeOff } from '@tabler/icons-react';



const invalidText = m['common.invalid']();
export const signUpSchema = z.object({
  name: z.string().min(3).regex(/^[A-Za-z]+ [A-Za-z]+$/, { message: invalidText }),
  email: z.email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});


export type TSignUpSchema = z.infer<typeof signUpSchema>;

interface IProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  id?: string;
  form: UseFormReturn<TSignUpSchema>;
  onSubmit: (data: TSignUpSchema) => void;
  disabled?: boolean;
}

export const SignUpForm: FC<IProps> = ({ form, id, onSubmit, disabled, ...props }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <form
      id={id ?? 'sign-up-form'}
      onSubmit={form.handleSubmit(onSubmit)}
      method="post"
      {...props}
    >
      <fieldset disabled={disabled}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="full-name-input">
                  {m['common.full_name']()}
                </FieldLabel>
                <Input
                  {...field}
                  id="full-name-input"
                  name="name"
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  placeholder="John Doe"
                />
                {fieldState.invalid && (<FieldError errors={[fieldState.error]}/>)}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email-input">
                  {m['common.email']()}
                </FieldLabel>
                <Input
                  {...field}
                  id="email-input"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="johndoe@yahoo.com"
                />
                {fieldState.invalid && (<FieldError errors={[fieldState.error]}/>)}
              </Field>
            )}
          />

          <div className="grid sm:grid-cols-2 gap-4">
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password-input">
                    {m['common.password']()}
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="password-input"
                      type={isPasswordVisible ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      placeholder="*********"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-xs"
                        aria-label={m['components.auth.sign_up_card.show_passwords']()}
                        title={m['components.auth.sign_up_card.show_passwords']()}
                        onClick={() => setIsPasswordVisible(pv => !pv)}
                      >
                        {isPasswordVisible ? <IconEye/> : <IconEyeOff/>}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (<FieldError errors={[fieldState.error]}/>)}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirm-password-input">
                    {m['components.auth.sign_up_card.confirm_password']()}
                  </FieldLabel>

                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id="comfirm-password-input"
                      type={isPasswordVisible ? 'text' : 'password'}
                      aria-invalid={fieldState.invalid}
                      placeholder="*********"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        size="icon-xs"
                        aria-label={m['components.auth.sign_up_card.show_passwords']()}
                        title={m['components.auth.sign_up_card.show_passwords']()}
                        onClick={() => setIsPasswordVisible(pv => !pv)}
                      >
                        {isPasswordVisible ? <IconEye/> : <IconEyeOff/>}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && (<FieldError errors={[fieldState.error]}/>)}
                </Field>
              )}
            />
          </div>

        </FieldGroup>
      </fieldset>
    </form>
  );
};