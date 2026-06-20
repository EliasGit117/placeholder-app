import { z } from 'zod';


export enum SessionState {
  Active = 'active',
  Expired = 'expired'
}

export const sessionStateSchema = z.enum(SessionState);
export type TSessionState = z.infer<typeof sessionStateSchema>;
