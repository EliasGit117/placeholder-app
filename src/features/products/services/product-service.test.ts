import { describe, expect, it } from 'vitest';
import {
  buildFullSlug,
  generateVariantSlug,
  slugifyValue,
  validateAttributesAgainstSchema,
} from './product-service.ts';
import type { TOptionSchema } from '@/features/products/schemas/option-schema.ts';

const schema: TOptionSchema = {
  color: {
    labelRo: 'Culoare',
    labelRu: 'Цвет',
    values: [
      { value: 'red', labelRo: 'Roșu', labelRu: 'Красный' },
      { value: 'blue', labelRo: 'Albastru', labelRu: 'Синий' },
    ],
  },
  size: {
    labelRo: 'Mărime',
    labelRu: 'Размер',
    values: [
      { value: 'S', labelRo: 'S', labelRu: 'S' },
      { value: 'M', labelRo: 'M', labelRu: 'M' },
      { value: 'L', labelRo: 'L', labelRu: 'L' },
    ],
  },
};

describe('slugifyValue', () => {
  it('lowercases and hyphenates non-alphanumerics', () => {
    expect(slugifyValue('Dark Red')).toBe('dark-red');
    expect(slugifyValue('XL / 42')).toBe('xl-42');
    expect(slugifyValue('  M  ')).toBe('m');
  });
});

describe('generateVariantSlug', () => {
  it('follows optionSchema key order regardless of attribute order', () => {
    expect(generateVariantSlug(schema, { size: 'M', color: 'red' })).toBe('red-m');
    expect(generateVariantSlug(schema, { color: 'red', size: 'M' })).toBe('red-m');
  });

  it('is deterministic for the same input', () => {
    const a = generateVariantSlug(schema, { color: 'blue', size: 'L' });
    const b = generateVariantSlug(schema, { color: 'blue', size: 'L' });
    expect(a).toBe(b);
    expect(a).toBe('blue-l');
  });
});

describe('buildFullSlug', () => {
  it('joins product and variant slug with a hyphen', () => {
    expect(buildFullSlug('cotton-tee', 'red-m')).toBe('cotton-tee-red-m');
  });
});

describe('validateAttributesAgainstSchema', () => {
  it('accepts a fully-specified valid attribute set', () => {
    expect(() => validateAttributesAgainstSchema(schema, { color: 'red', size: 'M' })).not.toThrow();
  });

  it('rejects a missing key', () => {
    expect(() => validateAttributesAgainstSchema(schema, { color: 'red' })).toThrow(/Missing attribute 'size'/);
  });

  it('rejects a value outside the allowed list', () => {
    expect(() => validateAttributesAgainstSchema(schema, { color: 'green', size: 'M' })).toThrow(/not allowed/);
  });

  it('rejects an unknown key', () => {
    expect(() => validateAttributesAgainstSchema(schema, { color: 'red', size: 'M', material: 'cotton' }))
      .toThrow(/Unknown attribute 'material'/);
  });
});
