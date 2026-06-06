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
  nameRo: z.string().trim().min(1).max(64),
  nameRu: z.string().trim().min(1).max(64),
});

export const productOptionFormSchema = z.object({
  key: machineKey,
  nameRo: z.string().trim().min(1).max(64),
  nameRu: z.string().trim().min(1).max(64),
  values: z.array(optionValueFormSchema).min(1),
}).superRefine((option, ctx) => {
  const seen = new Set<string>();
  option.values.forEach((v, i) => {
    if (v.value && seen.has(v.value))
      ctx.addIssue({ code: 'custom', path: ['values', i, 'value'], message: 'Duplicate value' });
    else
      seen.add(v.value);
  });
});

export const variantFormSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  sku: z.string().trim().min(1).max(128),
  price: z.number().int().nonnegative(),
  optionValues: z.record(z.string(), z.string()),
});

export const productFormSchema = z.object({
  nameRo: z.string().trim().min(1).max(128),
  nameRu: z.string().trim().min(1).max(128),
  shortDescriptionRo: z.string().trim().max(512).optional(),
  shortDescriptionRu: z.string().trim().max(512).optional(),
  slug: slugSchema,
  state: z.enum(ProductState),
  categoryId: z.number().int().positive().nullable(),
  options: z.array(productOptionFormSchema),
  variants: z.array(variantFormSchema).min(1),
});

export type TOptionValueForm = z.infer<typeof optionValueFormSchema>;
export type TProductOptionForm = z.infer<typeof productOptionFormSchema>;
export type TVariantForm = z.infer<typeof variantFormSchema>;
export type TProductForm = z.infer<typeof productFormSchema>;

// Basic product fields only — options and variants are managed by their own cards/sheets on the
// details page, not as part of this form.
export const productDetailsFormSchema = productFormSchema.pick({
  nameRo: true,
  nameRu: true,
  shortDescriptionRo: true,
  shortDescriptionRu: true,
  slug: true,
  state: true,
  categoryId: true,
});

export type TProductDetailsForm = z.infer<typeof productDetailsFormSchema>;

/** Builds the API `options` record from the flat form option list (key order preserved). */
export function optionsToRecord(options: TProductOptionForm[]): TOptions {
  return Object.fromEntries(
    options.map(o => [o.key, { nameRo: o.nameRo, nameRu: o.nameRu, values: o.values }]),
  );
}

/** Reverses optionsToRecord for editing an existing product. */
export function recordToOptions(options: TOptions): TProductOptionForm[] {
  return Object.entries(options).map(([key, option]) => ({
    key,
    nameRo: option.nameRo,
    nameRu: option.nameRu,
    values: option.values.map(v => ({ value: v.value, nameRo: v.nameRo, nameRu: v.nameRu })),
  }));
}

export function emptyOption(): TProductOptionForm {
  return { key: '', nameRo: '', nameRu: '', values: [{ value: '', nameRo: '', nameRu: '' }] };
}

export function detailsDefaultsFromProduct(product: TProductWithVariants): TProductDetailsForm {
  return {
    nameRo: product.nameRo,
    nameRu: product.nameRu,
    shortDescriptionRo: product.shortDescriptionRo ?? '',
    shortDescriptionRu: product.shortDescriptionRu ?? '',
    slug: product.slug,
    state: product.state,
    categoryId: product.categoryId,
  };
}
