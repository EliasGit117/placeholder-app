import { type FC, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { IconEdit } from '@tabler/icons-react';
import { authClient } from '@/lib/auth';
import { orpc } from '@/lib/orpc';
import { useAuth } from '@/hooks/use-auth';
import { m } from '@/paraglide/messages';

const schema = z.object({
  name: z.string().trim().min(1),
});

type TSchema = z.infer<typeof schema>;

export const UpdateNameDialog: FC = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const form = useForm<TSchema>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '' },
  });

  useEffect(() => {
    if (open) form.reset({ name: user?.name ?? '' });
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: TSchema) => {
      const result = await authClient.updateUser({ name: data.name });
      if (result.error) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orpc.sessions.current.queryKey() });
      toast.success(m['pages.settings.profile.update_success']());
      setOpen(false);
    },
    onError: (error) => {
      toast.error(m['common.error'](), { description: error.message });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconEdit size={14}/>
          {m['common.edit']()}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{m['pages.settings.profile.edit_name']()}</DialogTitle>
          <DialogDescription>{m['pages.settings.profile.edit_name_description']()}</DialogDescription>
        </DialogHeader>
        <form id="update-name-form" onSubmit={form.handleSubmit((data) => mutate(data))}>
          <fieldset disabled={isPending}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{m['common.full_name']()}</FieldLabel>
                    <Input {...field} autoComplete="off" placeholder="Alex Mason"/>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                  </Field>
                )}
              />
            </FieldGroup>
          </fieldset>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {m['common.close']()}
          </Button>
          <LoadingButton form="update-name-form" type="submit" loading={isPending}>
            {m['common.save']()}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
