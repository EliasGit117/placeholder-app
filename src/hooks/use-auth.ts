import { useRouteContext } from '@tanstack/react-router';

export const useAuth = () => {
  const { session, user } = useRouteContext({ from: '__root__' });

  return {
    session: session,
    user: user,
  };
}