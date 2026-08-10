import { contextFactory } from '@/lib/utils/context-factory.ts';
import { type ReactNode, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { client, orpc } from '@/lib/orpc';


interface IState {
  isPending: boolean;
  items: Set<number>;
}

interface IActions {
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
}

interface IContextValue extends IState, IActions {}

const [FavoritesContext, useFavoritesContext] = contextFactory<IContextValue>({ name: 'FavoritesContext' });

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();
  const favoritesQuery = orpc.products.getFavorites.queryOptions();

  const { data, isPending } = useQuery(favoritesQuery);
  const items = useMemo(() => new Set(data ?? []), [data]);

  const addMutation = useMutation({
    mutationFn: (id: number) => client.products.addToFavorites({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: favoritesQuery.queryKey });
      const previous = queryClient.getQueryData(favoritesQuery.queryKey);
      queryClient.setQueryData(favoritesQuery.queryKey, (current = []) =>
        current.includes(id) ? current : [id, ...current]
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context) queryClient.setQueryData(favoritesQuery.queryKey, context.previous);
    },
    onSuccess: (next) => queryClient.setQueryData(favoritesQuery.queryKey, next),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => client.products.removeFromFavorites({ id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: favoritesQuery.queryKey });
      const previous = queryClient.getQueryData(favoritesQuery.queryKey);
      queryClient.setQueryData(favoritesQuery.queryKey, (current = []) =>
        current.filter((favoriteId) => favoriteId !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context) queryClient.setQueryData(favoritesQuery.queryKey, context.previous);
    },
    onSuccess: (next) => queryClient.setQueryData(favoritesQuery.queryKey, next),
  });

  const add = (id: number) => addMutation.mutate(id);
  const remove = (id: number) => removeMutation.mutate(id);
  const toggle = (id: number) => (items.has(id) ? remove(id) : add(id));

  const value = {
    items: items,
    isPending: isPending,
    toggle: toggle,
    remove: remove,
    add: add,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export { useFavoritesContext };
