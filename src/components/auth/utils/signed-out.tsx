import { PropsWithChildren } from 'react';
import { useSession } from '@/hooks/use-session.ts';

interface IProps extends PropsWithChildren {}

export const SignedOut = ({ children }: IProps) => {
  const { session } = useSession();
  return !session ? children : null
}