import { createContext, useContext } from 'react';

interface IParams {
  name?: string;
}

export function contextFactory<T extends unknown | null>(params?: IParams) {
  const { name } = params ?? {};

  const context = createContext<T | undefined>(undefined);

  const useCtx = () => {
    const ctx = useContext(context);

    if (ctx === undefined)
      throw new Error(name ?
        `${name}: useContext must be used inside of a Provider with a value` :
        'useContext must be used inside of a Provider with a value'
      );

    return ctx;
  };

  return [context, useCtx] as const;
}
