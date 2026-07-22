import { z } from 'zod';


export const categoryTreeRequestSchema = z.object({
  depth: z.number().int().min(1).max(10).default(2),
});

export type TCategoryTreeRequest = z.infer<typeof categoryTreeRequestSchema>;
