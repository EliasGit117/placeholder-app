import { z } from 'zod';


// A single allowed value for an option. `value` is the stable machine identifier stored in
// variant attributes and used to derive slugs; labelRo/labelRu are the localized display labels.
export const optionValueSchema = z.object({
  value: z.string().trim().min(1).max(64),
  labelRo: z.string().trim().min(1).max(64),
  labelRu: z.string().trim().min(1).max(64),
});

// One option (e.g. "color") with a localized label and its list of allowed values.
export const productOptionSchema = z.object({
  labelRo: z.string().trim().min(1).max(64),
  labelRu: z.string().trim().min(1).max(64),
  values: z.array(optionValueSchema).min(1),
});

// The full option matrix, keyed by the stable machine option key (e.g. "color", "size").
// Key insertion order defines the deterministic variant-slug order.
export const optionSchemaSchema = z.record(
  z.string().trim().min(1).max(64),
  productOptionSchema,
);

// Variant attributes: option key -> selected machine value (e.g. { color: "red", size: "m" }).
export const attributesSchema = z.record(
  z.string().trim().min(1).max(64),
  z.string().trim().min(1).max(64),
);

export type TOptionValue = z.infer<typeof optionValueSchema>;
export type TProductOption = z.infer<typeof productOptionSchema>;
export type TOptionSchema = z.infer<typeof optionSchemaSchema>;
export type TAttributes = z.infer<typeof attributesSchema>;
