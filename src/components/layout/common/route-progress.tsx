import { type FC, type ReactNode, useEffect } from 'react';
import { useRouterState } from '@tanstack/react-router';
import { ProgressProvider, useProgress } from '@bprogress/react';

interface IProps {
  children: ReactNode;
}

const delayMs = 120;

export const RouteProgressProvider: FC<IProps> = ({ children }) => {
  return (
    <ProgressProvider options={{ showSpinner: false }} color="var(--primary)" height="2px" delay={delayMs}>
      {children}
    </ProgressProvider>
  );
}

export const RouteProgressController: FC = () => {
  const isNavigating = useRouterState({ select: (state) => state.status === 'pending' });
  const { start, stop } = useProgress();

  useEffect(() => {
    if (isNavigating) {
      start(undefined, delayMs);
      return;
    }

    stop();
  }, [isNavigating, start, stop]);

  return null;
}
