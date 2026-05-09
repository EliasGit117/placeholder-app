import { z } from 'zod';


export const dateRangeSchema = z.object({
  from: z.union([z.date(), z.iso.datetime().transform(val => new Date(val))]).optional(),
  to: z.union([z.date(), z.iso.datetime().transform(val => new Date(val))]).optional(),
});

export type TDateRange = z.infer<typeof dateRangeSchema>;


export const numberRangeSchema = z
  .tuple([z.number().nullable(), z.number().nullable()])
  .refine(([from, to]) => from !== null || to !== null, {
    message: "At least one of 'from' or 'to' must be defined",
  })
  .refine(([from, to]) => {
    if (from !== null && to !== null) {
      return from <= to;
    }
    return true;
  }, {
    message: "'from' must be less than or equal to 'to'",
  });

export type TNumberRange = z.infer<typeof numberRangeSchema>;