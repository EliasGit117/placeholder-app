import { type FC, useEffect } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconDeviceFloppy, IconFilePlus, IconX } from '@tabler/icons-react';
import { useUserSheet, UserSheetMode } from './provider';
import { createUserSchema, updateUserSchema, type TCreateUser, type TUpdateUser } from './schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth';
import { UserForm } from './form';
import { toast } from 'sonner';
import { m } from '@/paraglide/messages';


interface IProps {
  onSuccess?: () => void;
}

type TUserData = { name?: string | null; email: string; role?: string | null; emailVerified?: boolean };

export const UserSheet: FC<IProps> = ({ onSuccess }) => {
  const { isOpen, options, close } = useUserSheet();

  const mode = options?.mode;
  const userId = options?.mode === UserSheetMode.Update ? options.userId : undefined;

  const form = useForm<TCreateUser | TUpdateUser>({
    resolver: zodResolver(mode === UserSheetMode.Create ? createUserSchema : updateUserSchema),
    defaultValues: getFormValues(),
  });

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: async () => {
      const result = await authClient.admin.getUser({ query: { id: userId! } });
      if (result.error) throw new Error(result.error.message ?? 'Failed to fetch user');
      return result.data ?? null;
    },
    enabled: mode === UserSheetMode.Update && !!userId,
    staleTime: 0,
    gcTime: 0,
  });

  const onMutationSuccess = () => {
    onSuccess?.();
    close();
  };

  const onMutationError = (error: unknown) => {
    const message = error instanceof Error ? error.message : m['common.error']();
    toast.error(m['common.error'](), { description: message });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: async (values: TCreateUser) => {
      const result = await authClient.admin.createUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      if (result.error) throw new Error(result.error.message ?? 'Failed to create user');
      return result.data;
    },
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: async (values: TUpdateUser) => {
      if (!userId) throw new Error('Missing user ID');

      const data: Record<string, unknown> = {};
      if (values.name) data.name = values.name;
      if (values.email) data.email = values.email;
      if (values.role) data.role = values.role;

      if (values.emailVerified !== undefined) data.emailVerified = values.emailVerified;

      if (Object.keys(data).length > 0) {
        const result = await authClient.admin.updateUser({ userId, data });
        if (result.error) throw new Error(result.error.message ?? 'Failed to update user');
      }

      if (values.password) {
        const pwResult = await authClient.admin.setUserPassword({ userId, newPassword: values.password });
        if (pwResult.error) throw new Error(pwResult.error.message ?? 'Failed to set password');
      }
    },
    onSuccess: onMutationSuccess,
    onError: onMutationError,
  });

  const onOpenChange = (v: boolean) => {
    if (isCreating || isUpdating || v) return;
    close();
  };

  const onSubmit = (values: TCreateUser | TUpdateUser) => {
    if (mode === UserSheetMode.Create) {
      const parsed = createUserSchema.safeParse(values);
      if (!parsed.success) return;
      create(parsed.data);
      return;
    }

    const cleaned: TUpdateUser = {};
    if (values.name) cleaned.name = values.name;
    if (values.email) cleaned.email = values.email;
    if (values.role) cleaned.role = values.role as 'user' | 'admin';
    if ((values as TUpdateUser).emailVerified !== undefined) cleaned.emailVerified = (values as TUpdateUser).emailVerified;
    if (values.password) cleaned.password = values.password;
    update(cleaned);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (mode === UserSheetMode.Create || userData == null) {
      form.reset(getFormValues());
      return;
    }

    form.reset(getFormValues(userData));
  }, [isOpen, mode, userData]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full! max-w-full! sm:max-w-full! md:max-w-2xl! gap-0 border-l-0! md:border-l!"
        showCloseButton={false}
      >
        <SheetHeader className="text-left">
          <SheetTitle>
            {mode === UserSheetMode.Update
              ? m['pages.users.index.sheet.edit_title']()
              : m['pages.users.index.sheet.create_title']()}
          </SheetTitle>
          <SheetDescription>
            {mode === UserSheetMode.Update
              ? m['pages.users.index.sheet.edit_description']()
              : m['pages.users.index.sheet.create_description']()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto mr-2 my-2" type="always">
          <UserForm
            id="user-form"
            form={form}
            className="px-4 py-1"
            loading={isLoadingUser}
            disabled={isCreating || isUpdating}
            isUpdate={mode === UserSheetMode.Update}
            onSubmit={onSubmit}
          />
        </ScrollArea>

        <SheetFooter className="flex flex-col sm:flex-row gap-4 justify-between items-end pt-0">
          <div className="flex flex-row sm:justify-end gap-2 w-full">
            <SheetClose className="grow sm:grow-0 sm:min-w-32" asChild>
              <Button variant="outline" disabled={isCreating || isUpdating}>
                <IconX/>
                <span>{m['common.close']()}</span>
              </Button>
            </SheetClose>

            <LoadingButton
              form="user-form"
              className="grow sm:min-w-32 sm:grow-0"
              disabled={isLoadingUser}
              loading={isCreating || isUpdating}
            >
              {mode === UserSheetMode.Create ? <IconFilePlus/> : <IconDeviceFloppy/>}
              <span>{mode === UserSheetMode.Create ? m['common.create']() : m['common.save']()}</span>
            </LoadingButton>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

function getFormValues(user?: TUserData | null): TCreateUser | TUpdateUser {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: (user?.role as 'user' | 'admin' | undefined) ?? 'user',
    ...(user != null ? { emailVerified: user.emailVerified ?? false } : {}),
    password: '',
  };
}
