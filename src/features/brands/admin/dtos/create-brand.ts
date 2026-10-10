import { z } from 'zod';


export const createBrandDtoSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
});

export type TCreateBrandDto = z.infer<typeof createBrandDtoSchema>;
