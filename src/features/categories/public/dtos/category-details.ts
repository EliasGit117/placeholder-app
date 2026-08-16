import { z } from 'zod';


export const categoryAncestorDtoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
});

export type TCategoryAncestorDto = z.infer<typeof categoryAncestorDtoSchema>;

export const categoryDetailsDtoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  ancestors: z.array(categoryAncestorDtoSchema),
});

export type TCategoryDetailsDto = z.infer<typeof categoryDetailsDtoSchema>;
