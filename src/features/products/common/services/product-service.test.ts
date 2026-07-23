import { describe, expect, it } from 'vitest';
import { validateOptionValues } from './product-service.ts';
import { buildFullSlug, slugifyValue } from '@/features/products/common/lib/slug.ts';
import type { TOptions } from '@/features/products/common/dtos/option-schema.ts';

const options: TOptions = {
  color: {
    nameRo: 'Culoare',
    nameRu: 'Цвет',
    values: [
      { value: 'red', nameRo: 'Roșu', nameRu: 'Красный' },
      { value: 'blue', nameRo: 'Albastru', nameRu: 'Синий' },
    ],
  },
  size: {
    nameRo: 'Mărime',
    nameRu: 'Размер',
    values: [
      { value: 'S', nameRo: 'S', nameRu: 'S' },
      { value: 'M', nameRo: 'M', nameRu: 'M' },
      { value: 'L', nameRo: 'L', nameRu: 'L' },
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
