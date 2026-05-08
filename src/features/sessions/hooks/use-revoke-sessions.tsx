import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query';
import { useConfirm } from '@/components/ui/confirm-dialog.tsx';
import { useSession } from '@/hooks/use-session.ts';
import { toast } from 'sonner';
import { orpc } from '@/lib/orpc';
import { TOrpcInputs, TOrpcOutputs } from '@/features/shared/orpc/router.ts';

type TParams = TOrpcInputs['admin']['sessions']['revoke'];
type TData = TOrpcOutputs['admin']['sessions']['revoke'];

type TOptions = Omit<UseMutationOptions<TData, Error, TParams>, 'mutationFn' | 'onMutate'> & {
  withConfirmation?: boolean;
  withToastProgression?: boolean;
};

export const useRevokeSessionsMutation = (options?: TOptions) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
  const { session } = useSession();

  return useMutation({
    mutationFn: async (params) => {
      if (options?.withConfirmation ?? true) {
        const count = params.ids.length;
        const isCurrentIncluded = params.ids.includes(session?.id ?? '');

        const isConfirmed = await confirm({
          title: `Revoke ${count} session${count > 1 ? 's' : ''}`,
          description: isCurrentIncluded
            ? `Are you sure you want to revoke ${count} session${
              count > 1 ? 's' : ''
            }? This includes your current session and you will be signed out.`
            : `Are you sure you want to revoke ${count} session${
              count > 1 ? 's' : ''
            }?`,
          confirmText: 'Revoke',
          cancelText: 'Cancel'
        });

        if (!isConfirmed) {
          return { revokedCount: 0 };
        }
      }

      const promise = orpc.admin.sessions.revoke.call({ ids: params.ids });

      if (options?.withToastProgression ?? true) {
        const count = params.ids.length;

        toast.promise(promise, {
          loading: `Revoking ${count} session${
            count > 1 ? 's' : ''
          }...`,
          success: (data) =>
            `${data.revokedCount} session${
              data.revokedCount > 1 ? 's' : ''
            } revoked successfully`,
          error: (err) =>
            err.message ??
            `Failed to revoke session${count > 1 ? 's' : ''}.`
        });
      }

      return await promise;
    },
    ...options,
    onSuccess: (data, variables, onMutateResult, context) => {
      if (data.revokedCount === 0)
        return;

      void queryClient.invalidateQueries({ queryKey: orpc.admin.sessions.key() });

      if (variables.ids.includes(session?.id ?? ''))
        void queryClient.invalidateQueries({ queryKey: orpc.sessions.current.queryKey() });

      options?.onSuccess?.(
        data,
        variables,
        onMutateResult,
        context
      );
    }
  });
};