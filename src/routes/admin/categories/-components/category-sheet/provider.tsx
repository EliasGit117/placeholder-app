import { type ReactNode, useState } from 'react';
import { contextFactory } from '@/lib/utils/context-factory.ts';

export enum CategorySheetMode {
  Create = 'create',
  Update = 'update',
}

interface ICategorySheetCreateOptions {
  mode: CategorySheetMode.Create;
  parentId?: number;
}

interface ICategorySheetUpdateOptions {
  mode: CategorySheetMode.Update;
  categoryId: number;
}

export type TCategorySheetOptions = ICategorySheetCreateOptions | ICategorySheetUpdateOptions;

interface ICategorySheetActions {
  open: (options: TCategorySheetOptions) => void;
  close: () => void;
}

interface ICategorySheetState {
  isOpen: boolean;
  options?: TCategorySheetOptions;
}

// Split into two contexts: stable actions (never re-renders consumers) and mutable state.
const [CategorySheetActionsContext, useCategorySheetActions] = contextFactory<ICategorySheetActions>({ name: 'CategorySheetActionsContext' });
const [CategorySheetStateContext, useCategorySheetState] = contextFactory<ICategorySheetState>({ name: 'CategorySheetStateContext' });

/** Full hook — use in CategorySheet (needs both state and actions). */
export const useCategorySheet = () => ({
  ...useCategorySheetActions(),
  ...useCategorySheetState(),
});

/** Actions-only hook — use in CategoryTree / triggers so they don't re-render on open/close. */
export { useCategorySheetActions };

export const CategorySheetProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<TCategorySheetOptions>();

  const open = (opts: TCategorySheetOptions) => setOptions(opts);
  const close = () => setOptions(undefined);

  return (
    <CategorySheetActionsContext.Provider value={{ open, close }}>
      <CategorySheetStateContext.Provider value={{ isOpen: !!options, options }}>
        {children}
      </CategorySheetStateContext.Provider>
    </CategorySheetActionsContext.Provider>
  );
};
