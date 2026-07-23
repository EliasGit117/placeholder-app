import { getCurrentSession } from '@/features/sessions/public/routes/current-session.ts';


export const sessionsPublicRoutes = {
  current: getCurrentSession
};