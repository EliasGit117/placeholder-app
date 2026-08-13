import type { ZodType } from 'zod';
import { getCookie, setCookie } from '@orpc/server/helpers';

interface ICookieStoreOptions {
  maxAge?: number;
}

export function createCookieStore<T>(
  name: string,
  schema: ZodType<T>,
  defaultValue: T,
  options: ICookieStoreOptions = {},
) {
  const { maxAge = 31536000 } = options;

  function read(headers: Headers): T {
    const raw = getCookie(headers, name);
    if (!raw) return defaultValue;

    try {
      return schema.catch(defaultValue).parse(JSON.parse(raw));
    } catch {
      return defaultValue;
    }
  }

  function write(resHeaders: Headers | undefined, value: T) {
    setCookie(resHeaders, name, JSON.stringify(value), {
      path: '/',
      sameSite: 'lax',
      maxAge,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return { read, write };
}
