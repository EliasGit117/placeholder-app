import { contextFactory } from '@/lib/utils/context-factory.ts';
import { type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { client, orpc } from '@/lib/orpc';

interface ICartItem {
  id: number;
  count: number;
}

interface IState {
  isPending: boolean;
  items: ICartItem[];
  totalCount: number;
}

interface IActions {
  add: (id: number, count?: number) => void;
  remove: (id: number) => void;
  clear: () => void;
}

interface IContextValue extends IState, IActions {}

const [CartContext, useCartContext] = contextFactory<IContextValue>({ name: 'CartContext' });

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const cartQuery = orpc.checkout.getCart.queryOptions();
  const { data, isPending } = useQuery(cartQuery);
  const items = data ?? [];

  const addMutation = useOptimisticCartMutation(
    cartQuery.queryKey,
    (vars: { id: number; count: number }) => client.checkout.addToCart(vars),
    (current, vars) => {
      const existing = current.find((item) => item.id === vars.id);
      const nextCount = (existing?.count ?? 0) + vars.count;

      if (nextCount <= 0) return current.filter((item) => item.id !== vars.id);

      return existing ?
        current.map((item) => item.id === vars.id ? { ...item, count: nextCount } : item) :
        [{ id: vars.id, count: nextCount }, ...current];
    }
  );

  const removeMutation = useOptimisticCartMutation(
    cartQuery.queryKey,
    (id: number) => client.checkout.removeFromCart({ id }),
    (current, id) => current.filter((item) => item.id !== id)
  );

  const clearMutation = useOptimisticCartMutation<void>(
    cartQuery.queryKey,
    () => client.checkout.clearCart(),
    () => []
  );

  const value: IContextValue = {
    items: items,
    isPending: isPending,
    totalCount: items.reduce((sum, item) => sum + item.count, 0),
    add: (id, count = 1) => addMutation.mutate({ id, count }),
    remove: (id) => removeMutation.mutate(id),
    clear: () => clearMutation.mutate(),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export { useCartContext };


function useOptimisticCartMutation<TVars>(
  queryKey: QueryKey,
  mutationFn: (vars: TVars) => Promise<ICartItem[]>,
  nextItems: (current: ICartItem[], vars: TVars) => ICartItem[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<ICartItem[]>(queryKey) ?? [];
      queryClient.setQueryData(queryKey, nextItems(previous, vars));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (next) => queryClient.setQueryData(queryKey, next),
  });
}
