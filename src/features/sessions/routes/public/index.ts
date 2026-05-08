import { getCurrentSession } from '@/features/sessions/routes/public/current-session.ts';


export const sessionsPublicRoutes = {
  current: getCurrentSession
};