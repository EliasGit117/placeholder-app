import { z } from 'zod';


export const revokeSessionsDtoSchema = z.object({
  ids: z.array(z.string()).min(1)
});

export type TRevokeSessionsDto = z.infer<typeof revokeSessionsDtoSchema>;