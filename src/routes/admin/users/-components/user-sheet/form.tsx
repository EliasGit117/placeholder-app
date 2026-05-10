import { type ComponentProps, type FC, useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconChevronDown,
  IconEye,
  IconEyeOff,
  IconMailCheck,
  IconMailX,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react';
import { m } from '@/paraglide/messages';
import type { TCreateUser, TUpdateUser } from './schemas';


const ROLES = ['user', 'admin'] as const;

interface IProps extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  id?: string;
  form: UseFormReturn<TCreateUser | TUpdateUser>;
  onSubmit: (data: TCreateUser | TUpdateUser) => void;
  loading?: boolean;
  disabled?: boolean;
  isUpdate?: boolean;
}

export const UserForm: FC<IProps> = ({
                                       id = 'user-form',
                                       form,
                                       onSubmit,
                                       disabled,
                                       loading,
                                       isUpdate,
                                       ...formProps
                                     }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (loading)
    return (
      <form id={id} {...formProps}>
        <LoadingSkeleton isUpdate={isUpdate}/>
      </form>
    );

  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)} {...formProps}>
      <fieldset disabled={disabled}>
        <FieldGroup className="grid grid-cols-2 gap-2 sm:gap-4">

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>{m['common.full_name']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} placeholder="Alex Mason" autoComplete="off"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full sm:col-span-1">
                <FieldLabel>{m['common.email']()}</FieldLabel>
                <Input {...field} value={field.value ?? ''} placeholder="alex.mason@example.com" autoComplete="off"/>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

          <Controller
            name="role"
            control={form.control}
            render={({ field }) => (
              <Field className="col-span-full sm:col-span-1">
                <FieldLabel>{m['pages.users.index.table.role']()}</FieldLabel>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      {field.value === 'admin' ? <IconShieldCheck className="text-muted-foreground" size={16}/> :
                        <IconUser className="text-muted-foreground" size={16}/>}
                      <span>{field.value ? m[`enums.user_role.${field.value}`]?.() ?? field.value : m['pages.users.index.table.role']()}</span>
                      <IconChevronDown className="ml-auto opacity-50" size={16}/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuRadioGroup value={field.value ?? ''} onValueChange={field.onChange}>
                      {ROLES.map(role => (
                        <DropdownMenuRadioItem key={role} value={role}>
                          {role === 'admin' ? <IconShieldCheck className="text-muted-foreground" size={16}/> :
                            <IconUser className="text-muted-foreground" size={16}/>}
                          <span>{m[`enums.user_role.${role}`]?.() ?? role}</span>
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Field>
            )}
          />

          {isUpdate && (
            <Controller
              name="emailVerified"
              control={form.control}
              render={({ field }) => (
                <Field className="col-span-full sm:col-span-1">
                  <FieldLabel>{m['pages.users.index.table.emailVerified']()}</FieldLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        {field.value ? (
                          <IconMailCheck className="text-muted-foreground" size={16}/>
                        ) : (
                          <IconMailX className="text-muted-foreground" size={16}/>
                        )}
                        <span>
                          {field.value ? (
                            m['pages.users.index.table.verified']()) : (
                            m['pages.users.index.table.unverified']()
                          )}
                        </span>
                        <IconChevronDown className="ml-auto opacity-50" size={16}/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuRadioGroup
                        value={field.value === true ? 'true' : 'false'}
                        onValueChange={v => field.onChange(v === 'true')}
                      >
                        <DropdownMenuRadioItem value="true">
                          <IconMailCheck className="text-muted-foreground" size={16}/>
                          <span>{m['pages.users.index.table.verified']()}</span>
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="false">
                          <IconMailX className="text-muted-foreground" size={16}/>
                          <span>{m['pages.users.index.table.unverified']()}</span>
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Field>
              )}
            />
          )}

          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="col-span-full">
                <FieldLabel>
                  {m['common.password']()}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    value={field.value ?? ''}
                    autoComplete="new-password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    aria-invalid={fieldState.invalid}
                    placeholder="••••••••"
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton size="icon-xs" onClick={() => setIsPasswordVisible(pv => !pv)}>
                      {isPasswordVisible ? <IconEyeOff size={14}/> : <IconEye size={14}/>}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
              </Field>
            )}
          />

        </FieldGroup>
      </fieldset>
    </form>
  );
};


const LoadingSkeleton: FC<{ isUpdate?: boolean }> = ({ isUpdate }) => (
  <div className="grid grid-cols-2 gap-2 sm:gap-4">
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    <div className="col-span-full sm:col-span-1">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
    {isUpdate && (
      <div className="col-span-full sm:col-span-1">
        <Skeleton className="mb-2 h-4 w-24"/>
        <Skeleton className="h-9 w-full"/>
      </div>
    )}
    <div className="col-span-full">
      <Skeleton className="mb-2 h-4 w-24"/>
      <Skeleton className="h-9 w-full"/>
    </div>
  </div>
);
