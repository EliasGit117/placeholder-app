import { type ReactNode, useState } from 'react';
import { contextFactory } from '@/lib/utils/context-factory.ts';


export enum UserSheetMode {
  Create = 'create',
  Update = 'update'
}

interface IUserSheetCreateOptions {
  mode: UserSheetMode.Create;
}

interface IUserSheetUpdateOptions {
  mode: UserSheetMode.Update;
  userId: string;
}

export type TUserSheetOptions =
  | IUserSheetCreateOptions
  | IUserSheetUpdateOptions;

interface UserSheetContextValue {
  isOpen: boolean;
  options?: TUserSheetOptions;
  open: (options: TUserSheetOptions) => void;
  close: () => void;
}

const [UserSheetContext, useUserSheet] = contextFactory<UserSheetContextValue>({ name: 'UserSheetContext' });

export { useUserSheet };

export const UserSheetProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<TUserSheetOptions>();

  return (
    <UserSheetContext.Provider
      value={{
        isOpen: !!options,
        options,
        open: setOptions,
        close: () => setOptions(undefined),
      }}
    >
      {children}
    </UserSheetContext.Provider>
  );
};
