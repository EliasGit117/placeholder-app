import { type ChangeEvent, type FC, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { IconCamera, IconEdit, IconTrash } from '@tabler/icons-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { authClient } from '@/lib/auth';
import { orpc, client } from '@/lib/orpc';
import { useAuth } from '@/hooks/use-auth';
import { pickFirstLetters, xhrUpload } from '@/lib/utils';
import { m } from '@/paraglide/messages';
import type { TOrpcOutputs } from '@/features/shared/orpc/router';

type TUploadAvatarResponse = TOrpcOutputs['profile']['uploadAvatar'];

const avatarAccept = 'image/jpeg,image/png,image/webp';

const schema = z.object({
  name: z.string().trim().min(1),
});

type TSchema = z.infer<typeof schema>;

export const EditProfileDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
  });

  useEffect(() => {
    if (open) form.reset({ name: user?.name ?? '' });
  }, [open]);

  const invalidateSession = () =>
    queryClient.invalidateQueries({ queryKey: orpc.sessions.current.queryKey() });

  const saveName = useMutation({
    mutationFn: async (data: TSchema) => {
      const result = await authClient.updateUser({ name: data.name });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      void invalidateSession();
      toast.success(m['pages.settings.profile.update_success']());
      setOpen(false);
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append('file', file);
      return xhrUpload<TUploadAvatarResponse>('/api/profile/avatar', body);
    },
    onSuccess: () => {
      void invalidateSession();
      toast.success(m['pages.settings.profile.avatar_updated']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  const removeAvatar = useMutation({
    mutationFn: () => client.profile.deleteAvatar(),
    onSuccess: () => {
      void invalidateSession();
      toast.success(m['pages.settings.profile.avatar_removed']());
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  const isAvatarBusy = uploadAvatar.isPending || removeAvatar.isPending;
  const isPending = saveName.isPending || isAvatarBusy;

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) uploadAvatar.mutate(file);
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !isPending && setOpen(v)}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconEdit size={14} />
          {m['common.edit']()}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {m['pages.settings.profile.edit_profile']()}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {m['pages.settings.profile.edit_profile_description']()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col items-center gap-4 my-2">
          <Avatar className="size-24">
            {user?.image && (<AvatarImage src={user.image} alt={user.name ?? ''} />)}
            <AvatarFallback className='text-4xl'>
              {pickFirstLetters(user?.name ?? '', 2, 'uppercase')}
            </AvatarFallback>
          </Avatar>

          <input
            ref={inputRef}
            type="file"
            accept={avatarAccept}
            className="hidden"
            onChange={onPickFile}
          />

          <div className="flex flex-wrap gap-2">
            {user?.image && (
              <Button
                type="button"
                size="sm"
                variant="outline-destructive"
                disabled={isAvatarBusy}
                onClick={() => removeAvatar.mutate()}
              >
                <IconTrash size={14} />
                {m['pages.settings.profile.remove_avatar']()}
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              disabled={isAvatarBusy}
              onClick={() => inputRef.current?.click()}
              size="sm"
            >
              <IconCamera size={14} />
              <span>{m['pages.settings.profile.change_avatar']()}</span>
            </Button>
          </div>

          <form
            id="edit-profile-form"
            onSubmit={form.handleSubmit((data) => saveName.mutate(data))}
            className="w-full"
          >
            <fieldset disabled={isPending}>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>
                        {m['common.full_name']()}
                      </FieldLabel>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder="Alex Mason"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </fieldset>
          </form>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {m['common.close']()}
          </AlertDialogCancel>

          <AlertDialogAction asChild>
            <LoadingButton
              form="edit-profile-form"
              type="submit"
              loading={saveName.isPending}
              disabled={isAvatarBusy}
            >
              {m['common.save']()}
            </LoadingButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};