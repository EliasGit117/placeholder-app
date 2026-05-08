import type { Locale } from '@/paraglide/runtime';

export async function getZodErrorMap(locale: Locale) {

  switch (locale) {
    case 'ro':
      return (await import('@/lib/zod/ro-error-map.ts')).default()
    case 'ru':
      return (await import('@/lib/zod/ru-error-map.ts')).default()
    default:
      return (await import('@/lib/zod/en-error-map.ts')).default();
  }
}