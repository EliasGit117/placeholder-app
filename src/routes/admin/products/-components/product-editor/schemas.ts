import { z } from 'zod';
import { ProductState } from '~/prisma/generated/prisma/enums.ts';
import type { TOptions } from '@/features/products/schemas/option-schema.ts';
import type { TProductWithVariants } from '@/features/products/schemas/product.ts';

const slugSchema = z.string().trim().min(1).max(128)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

// A machine key/value (option key like "color", value like "red") must be slug-safe so the derived
// variant slug stays clean.
const machineKey = z.string().trim().min(1).max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

export const optionValueFormSchema = z.object({
  value: machineKey,
  labelRo: z.string().trim().min(1).max(64),
  labelRu: z.string().trim().min(1).max(64),
});

export const productOptionFormSchema = z.object({
  key: machineKey,
  labelRo: z.string().trim().min(1).max(64),
  labelRu: z.string().trim().min(1).max(64),
  values: z.array(optionValueFormSchema).min(1),
});

export const variantFormSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  optionValues: z.record(z.string(), z.string()),
});

export const productFormSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  descriptionRo: z.string().trim().max(512).optional(),
  descriptionRu: z.string().trim().max(512).optional(),
  slug: slugSchema,
  state: z.enum(ProductState),
  options: z.array(productOptionFormSchema),
  variants: z.array(variantFormSchema).min(1),
});

export type TOptionValueForm = z.infer<typeof optionValueFormSchema>;
export type TProductOptionForm = z.infer<typeof productOptionFormSchema>;
export type TVariantForm = z.infer<typeof variantFormSchema>;
export type TProductForm = z.infer<typeof productFormSchema>;

// Product fields without the variant array — used by the edit form, which manages
// variants through the dedicated endpoints rather than as a nested array.
export const productDetailsFormSchema = productFormSchema.pick({
  nameRo: true,
  nameRu: true,
  descriptionRo: true,
  descriptionRu: true,
  slug: true,
  state: true,
  options: true,
});

export type TProductDetailsForm = z.infer<typeof productDetailsFormSchema>;

/** Builds the API `options` record from the flat form option list (key order preserved). */
export function optionsToRecord(options: TProductOptionForm[]): TOptions {
  return Object.fromEntries(
    options.map(o => [o.key, { labelRo: o.labelRo, labelRu: o.labelRu, values: o.values }]),
  );
}

/** Reverses optionsToRecord for editing an existing product. */
export function recordToOptions(options: TOptions): TProductOptionForm[] {
  return Object.entries(options).map(([key, option]) => ({
    key,
    labelRo: option.labelRo,
    labelRu: option.labelRu,
    values: option.values.map(v => ({ value: v.value, labelRo: v.labelRo, labelRu: v.labelRu })),
  }));
}

/** Keeps only optionValues keys that still exist in the option list (drops stale picks). */
export function pruneOptionValues(
  optionValues: Record<string, string>,
  options: TProductOptionForm[],
): Record<string, string> {
  const keys = new Set(options.map(o => o.key));
  return Object.fromEntries(Object.entries(optionValues).filter(([k]) => keys.has(k)));
}

export function emptyVariant(): TVariantForm {
  return { nameRo: '', nameRu: '', price: 0, stock: 0, optionValues: {} };
}

export function emptyOption(): TProductOptionForm {
  return { key: '', labelRo: '', labelRu: '', values: [{ value: '', labelRo: '', labelRu: '' }] };
}

export function detailsDefaultsFromProduct(product: TProductWithVariants): TProductDetailsForm {
  return {
    nameRo: product.nameRo,
    nameRu: product.nameRu,
    descriptionRo: product.descriptionRo ?? '',
    descriptionRu: product.descriptionRu ?? '',
    slug: product.slug,
    state: product.state,
    options: recordToOptions(product.options),
  };
}
