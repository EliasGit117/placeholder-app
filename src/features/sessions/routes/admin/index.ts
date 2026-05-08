import { listSessions } from './list.ts';
import { revokeSessions } from './revoke-sessions.ts';


export const sessionsAdminRoutes = {
  list: listSessions,
  revoke: revokeSessions
};