import { z } from 'zod';


// A single allowed value for an option. `value` is the stable machine identifier stored in a
// variant's optionValues and used to derive slugs; nameRo/nameRu are the localized display labels.
export const optionValueSchema = z.object({
  value: z.string().trim().min(1).max(64),
  nameRo: z.string().trim().min(1).max(64),
  nameRu: z.string().trim().min(1).max(64),
});

// One option (e.g. "color") with a localized label and its list of allowed values.
export const productOptionSchema = z.object({
  nameRo: z.string().trim().min(1).max(64),
  nameRu: z.string().trim().min(1).max(64),
  values: z.array(optionValueSchema).min(1),
});

// Product.options — the full option matrix, keyed by the stable machine option key (e.g. "color").
// Key insertion order defines the deterministic variant-slug order.
export const optionsSchema = z.record(
  z.string().trim().min(1).max(64),
  productOptionSchema,
);

// ProductVariant.optionValues — option key -> selected machine value (e.g. { color: "red", size: "m" }).
export const optionValuesSchema = z.record(
  z.string().trim().min(1).max(64),
  z.string().trim().min(1).max(64),
);

export type TOptionValue = z.infer<typeof optionValueSchema>;
export type TProductOption = z.infer<typeof productOptionSchema>;
export type TOptions = z.infer<typeof optionsSchema>;
export type TOptionValues = z.infer<typeof optionValuesSchema>;
