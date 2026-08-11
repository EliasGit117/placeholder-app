import { contextFactory } from '@/lib/utils/context-factory.ts';
import { type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { client, orpc } from '@/lib/orpc';


interface IState {
  isPending: boolean;
  items: Set<number>;
}

interface IActions {
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
}

interface IContextValue extends IState, IActions {}

const [FavoritesContext, useFavoritesContext] = contextFactory<IContextValue>({ name: 'FavoritesContext' });

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const favoritesQuery = orpc.products.getFavorites.queryOptions();
  const { data, isPending } = useQuery(favoritesQuery);
  const items = new Set(data ?? []);

  const addMutation = useOptimisticFavoritesMutation(
    favoritesQuery.queryKey,
    (id: number) => client.products.addToFavorites({ id }),
    (current, id) => (current.includes(id) ? current : [id, ...current])
  );

  const removeMutation = useOptimisticFavoritesMutation(
    favoritesQuery.queryKey,
    (id: number) => client.products.removeFromFavorites({ id }),
    (current, id) => current.filter((favoriteId) => favoriteId !== id)
  );

  const clearMutation = useOptimisticFavoritesMutation<void>(
    favoritesQuery.queryKey,
    () => client.products.clearFavorites(),
    () => []
  );

  const toggle = (id: number) => (items.has(id) ? removeMutation.mutate(id) : addMutation.mutate(id));

  const value: IContextValue = {
    items: items,
    isPending: isPending,
    toggle: toggle,
    remove: (id) => removeMutation.mutate(id),
    add: (id) => addMutation.mutate(id),
    clear: () => clearMutation.mutate(),
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export { useFavoritesContext };


function useOptimisticFavoritesMutation<TVars>(
  queryKey: QueryKey,
  mutationFn: (vars: TVars) => Promise<number[]>,
  nextIds: (current: number[], vars: TVars) => number[]
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<number[]>(queryKey) ?? [];
      queryClient.setQueryData(queryKey, nextIds(previous, vars));
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context) queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (next) => queryClient.setQueryData(queryKey, next),
  });
}
