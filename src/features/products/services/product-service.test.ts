import { describe, expect, it } from 'vitest';
import {
  buildFullSlug,
  generateVariantSlug,
  slugifyValue,
  validateOptionValues,
} from './product-service.ts';
import type { TOptions } from '@/features/products/schemas/option-schema.ts';

const options: TOptions = {
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
  it('follows options key order regardless of optionValues order', () => {
    expect(generateVariantSlug(options, { size: 'M', color: 'red' })).toBe('red-m');
    expect(generateVariantSlug(options, { color: 'red', size: 'M' })).toBe('red-m');
  });

  it('is deterministic for the same input', () => {
    const a = generateVariantSlug(options, { color: 'blue', size: 'L' });
    const b = generateVariantSlug(options, { color: 'blue', size: 'L' });
    expect(a).toBe(b);
    expect(a).toBe('blue-l');
  });
});

describe('buildFullSlug', () => {
  it('joins product and variant slug with a hyphen', () => {
    expect(buildFullSlug('cotton-tee', 'red-m')).toBe('cotton-tee-red-m');
  });
});

describe('validateOptionValues', () => {
  it('accepts a fully-specified valid selection', () => {
    expect(() => validateOptionValues(options, { color: 'red', size: 'M' })).not.toThrow();
  });

  it('rejects a missing option', () => {
    expect(() => validateOptionValues(options, { color: 'red' })).toThrow(/Missing value for option 'size'/);
  });

  it('rejects a value outside the allowed list', () => {
    expect(() => validateOptionValues(options, { color: 'green', size: 'M' })).toThrow(/not allowed/);
  });

  it('rejects an unknown option', () => {
    expect(() => validateOptionValues(options, { color: 'red', size: 'M', material: 'cotton' }))
      .toThrow(/Unknown option 'material'/);
  });
});
