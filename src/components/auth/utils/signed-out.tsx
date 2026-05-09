import type { PropsWithChildren } from 'react';
import { useAuth } from '@/hooks/use-auth.ts';

interface IProps extends PropsWithChildren {}

export const SignedOut = ({ children }: IProps) => {
  const { session } = useAuth();
  return !session ? children : null
}